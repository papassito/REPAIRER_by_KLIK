package compensation

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"repairer/internal/contracts"
	"repairer/internal/security"
)

func Compensate(record contracts.LedgerRecord) error {
	if record.Operation.RiskClass != contracts.RiskReversible {
		return errors.New("automatic compensation is only allowed for REVERSIBLE operations")
	}
	if record.Compensation.DescriptorType != contracts.CompensationType || record.Compensation.DescriptorVersion != "1" {
		return errors.New("unsupported compensation descriptor")
	}
	if record.Compensation.TargetRef == "" || record.Compensation.BackupRef == "" || record.Compensation.BackupHash == "" {
		return errors.New("compensation requires target, backup, and expected hash")
	}

	// SECURITY FIX: Re-validate paths immediately before restoration to mitigate TOCTOU.
	if err := security.ValidatePath(record.Compensation.BackupRef, authorizedScope); err != nil {
		return fmt.Errorf("security validation failed for backup path during compensation: %w", err)
	}
	if err := security.ValidatePath(record.Compensation.TargetRef, authorizedScope); err != nil {
		return fmt.Errorf("security validation failed for target path during compensation: %w", err)
	}

	backup, err := readRegularFile(record.Compensation.BackupRef)
	if err != nil {
		return fmt.Errorf("read backup: %w", err)
	}

	hash := sha256.Sum256(backup)
	if actual := hex.EncodeToString(hash[:]); actual != record.Compensation.BackupHash {
		return errors.New("backup integrity verification failed")
	}

	if _, err := readRegularFile(record.Compensation.TargetRef); err != nil && !errors.Is(err, fs.ErrNotExist) {
		return fmt.Errorf("read target before compensation: %w", err)
	}
	if err := atomicReplace(record.Compensation.TargetRef, backup); err != nil {
		return fmt.Errorf("restore target: %w", err)
	}
	restored, err := readRegularFile(record.Compensation.TargetRef)
	if err != nil {
		return fmt.Errorf("could not read target after restore: %w", err)
	}

	restoredHash := sha256.Sum256(restored)
	if hex.EncodeToString(restoredHash[:]) != record.Compensation.BackupHash {
		return errors.New("restored target failed semantic verification")
	}
	return nil
}

func atomicReplace(target string, data []byte) error {
	dir := filepath.Dir(target)
	tmp, err := os.CreateTemp(dir, ".repairer-restore-*")
	if err != nil {
		return err
	}
	tmpPath := tmp.Name()
	defer os.Remove(tmpPath)

	if err := os.WriteFile(tmpPath, data, 0600); err != nil {
		return err
	}
	return os.Rename(tmpPath, target)
}
