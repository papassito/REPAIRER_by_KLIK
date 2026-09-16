package core

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
)

type Backup struct {
	Path   string
	SHA256 string
	Size   int64
}

func PrepareBackup(target, backup string) (Backup, error) {
	if target == "" || backup == "" || filepath.Clean(target) == filepath.Clean(backup) {
		return Backup{}, errors.New("target and backup must be distinct explicit paths")
	}
	data, err := readRegularFile(target)
	if err != nil {
		return Backup{}, fmt.Errorf("read target for backup: %w", err)
	}
	if err := os.MkdirAll(filepath.Dir(backup), 0700); err != nil {
		return Backup{}, fmt.Errorf("create backup directory: %w", err)
	}

	// O_EXCL ensures we don't overwrite an existing backup. This is an atomic check-and-create.
	file, err := os.OpenFile(backup, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0600)
	if err != nil {
		return Backup{}, fmt.Errorf("create backup file: %w", err)
	}

	// Ensure file is closed and removed on any error from this point forward.
	_, writeErr := file.Write(data)
	syncErr := file.Sync()
	closeErr := file.Close()

	if writeErr != nil {
		os.Remove(backup)
		return Backup{}, fmt.Errorf("write backup: %w", writeErr)
	}
	if syncErr != nil {
		os.Remove(backup)
		return Backup{}, fmt.Errorf("sync backup: %w", syncErr)
	}
	if closeErr != nil {
		os.Remove(backup)
		return Backup{}, fmt.Errorf("close backup: %w", closeErr)
	}

	// After a successful write, verify the content to protect against write errors
	// that don't return an error but result in corrupted data.
	verified, err := readRegularFile(backup)
	if err != nil || string(data) != string(verified) {
		os.Remove(backup) // Clean up the invalid backup file.
		if err != nil {
			return Backup{}, fmt.Errorf("backup verification failed on read-back: %w", err)
		}
		return Backup{}, errors.New("backup verification failed: content mismatch")
	}
	return Backup{Path: backup, SHA256: Sha256Hex(verified), Size: int64(len(verified))}, nil
}

func Compensate(record LedgerRecord) error {
	if record.Operation.RiskClass != RiskReversible {
		return errors.New("automatic compensation is only allowed for REVERSIBLE operations")
	}
	if record.Compensation.DescriptorType != CompensationType || record.Compensation.DescriptorVersion != "1" {
		return errors.New("unsupported compensation descriptor")
	}
	if record.Compensation.TargetRef == "" || record.Compensation.BackupRef == "" || record.Compensation.BackupHash == "" {
		return errors.New("compensation requires target, backup, and expected hash")
	}
	backup, err := readRegularFile(record.Compensation.BackupRef)
	if err != nil {
		return fmt.Errorf("read backup: %w", err)
	}
	if actual := Sha256Hex(backup); actual != record.Compensation.BackupHash {
		return errors.New("backup integrity verification failed")
	}
	if _, err := readRegularFile(record.Compensation.TargetRef); err != nil && !errors.Is(err, fs.ErrNotExist) {
		return fmt.Errorf("read target before compensation: %w", err)
	}
	if err := atomicReplace(record.Compensation.TargetRef, backup); err != nil {
		return fmt.Errorf("restore target: %w", err)
	}
	restored, err := readRegularFile(record.Compensation.TargetRef)
	if err != nil || Sha256Hex(restored) != record.Compensation.BackupHash {
		return errors.New("restored target failed semantic verification")
	}
	return nil
}

func readRegularFile(path string) ([]byte, error) {
	info, err := os.Lstat(path)
	if err != nil {
		return nil, err
	}
	if !info.Mode().IsRegular() {
		return nil, errors.New("path is not a regular file")
	}
	return os.ReadFile(path)
}

func atomicReplace(target string, data []byte) error {
	dir := filepath.Dir(target)
	tmp, err := os.CreateTemp(dir, ".repairer-restore-*")
	if err != nil {
		return err
	}
	tmpPath := tmp.Name()
	defer os.Remove(tmpPath)
	if err := tmp.Chmod(0600); err != nil {
		tmp.Close()
		return err
	}
	if _, err := tmp.Write(data); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Sync(); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	return os.Rename(tmpPath, target)
}

// Sha256Hex computes the SHA256 hash of data and returns it as a hex string.
func Sha256Hex(data []byte) string {
	hash := sha256.Sum256(data)
	return hex.EncodeToString(hash[:])
}
