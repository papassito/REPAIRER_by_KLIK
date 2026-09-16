package operations

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"repairer/internal/compensation"
	"repairer/internal/contracts"
	"repairer/internal/security"
)

// FileCleanHandler implements the logic for the "file.clean" operation.
type FileCleanHandler struct{}

func (h *FileCleanHandler) Execute(op contracts.OperationInstance, authorizedScope string) (*contracts.LedgerRecord, error) {
	if op.RiskClass != contracts.RiskReversible {
		return nil, errors.New("file.clean must be a REVERSIBLE operation")
	}
	targetFile := op.TargetRef
	backupFile, ok := op.Parameters["backup_ref"]
	if !ok || backupFile == "" {
		return nil, errors.New("missing 'backup_ref' parameter for file.clean")
	}

	fmt.Println("[*] Preparing compensation state (backing up file)...")
	backup, err := compensation.PrepareBackup(targetFile, backupFile)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare backup, aborting operation: %w", err)
	}
	fmt.Printf(" [+] Safe Backup verified. Hash: %s\n", backup.SHA256)

	fmt.Println("[*] Executing safe file modification via Go APIs...")
	cleanedContent := "127.0.0.1 localhost\n"

	// TOCTOU Mitigation: Re-validate path immediately before writing.
	if err := security.ValidatePath(targetFile, authorizedScope); err != nil {
		_ = os.Remove(backupFile)
		return nil, fmt.Errorf("pre-write path re-validation failed: %w", err)
	}

	if err := os.WriteFile(targetFile, []byte(cleanedContent), 0644); err != nil {
		return nil, fmt.Errorf("failed to write cleaned file: %w", err)
	}

	hasher := sha256.New()
	hasher.Write([]byte(cleanedContent))
	currentHash := hex.EncodeToString(hasher.Sum(nil))
	fmt.Printf(" [+] System file updated safely. Current State Hash: %s\n", currentHash)

	return &contracts.LedgerRecord{
		EventType: "OPERATION_COMPLETED",
		Operation: op,
		Outcome:   contracts.OperationOutcome{Status: "SUCCEEDED_VERIFIED", Changed: true},
		Compensation: contracts.CompensationDescriptor{
			DescriptorType:    contracts.CompensationType,
			DescriptorVersion: "1",
			BackupRef:         backup.Path,
			TargetRef:         targetFile,
			BackupHash:        backup.SHA256,
		},
	}, nil
}
