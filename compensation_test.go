package compensation_test

import (
	"os"
	"path/filepath"
	"repairer/internal/compensation"
	"repairer/internal/contracts"
	"testing"
)

func TestPrepareBackupAndCompensate(t *testing.T) {
	// 1. Setup
	scope := t.TempDir()
	originalContent := "original content"
	targetFile := filepath.Join(scope, "target.txt")
	backupFile := filepath.Join(scope, "target.bak")

	err := os.WriteFile(targetFile, []byte(originalContent), 0644)
	if err != nil {
		t.Fatalf("Failed to create test file: %v", err)
	}

	// 2. Test PrepareBackup
	backup, err := compensation.PrepareBackup(targetFile, backupFile)
	if err != nil {
		t.Fatalf("PrepareBackup failed: %v", err)
	}

	backupContent, err := os.ReadFile(backupFile)
	if err != nil {
		t.Fatalf("Failed to read backup file: %v", err)
	}

	if string(backupContent) != originalContent {
		t.Errorf("Backup content mismatch. Expected '%s', got '%s'", originalContent, string(backupContent))
	}

	// 3. Modify the target file to simulate a change
	modifiedContent := "modified content"
	err = os.WriteFile(targetFile, []byte(modifiedContent), 0644)
	if err != nil {
		t.Fatalf("Failed to modify target file: %v", err)
	}

	// 4. Create a ledger record for compensation
	record := contracts.LedgerRecord{
		Operation: contracts.OperationInstance{
			RiskClass: contracts.RiskReversible,
		},
		Compensation: contracts.CompensationDescriptor{
			DescriptorType:    contracts.CompensationType,
			DescriptorVersion: "1",
			BackupRef:         backup.Path,
			TargetRef:         targetFile,
			BackupHash:        backup.SHA256,
		},
	}

	// 5. Test Compensate
	err = compensation.Compensate(record)
	if err != nil {
		t.Fatalf("Compensate failed: %v", err)
	}

	// 6. Verify the result
	restoredContent, err := os.ReadFile(targetFile)
	if err != nil {
		t.Fatalf("Failed to read restored file: %v", err)
	}

	if string(restoredContent) != originalContent {
		t.Errorf("Restored content mismatch. Expected '%s', got '%s'", originalContent, string(restoredContent))
	}
}

func TestCompensateWithCorruptedBackup(t *testing.T) {
	scope := t.TempDir()
	targetFile := filepath.Join(scope, "target.txt")
	backupFile := filepath.Join(scope, "backup.txt")

	// Create a dummy backup file
	os.WriteFile(backupFile, []byte("some data"), 0644)

	record := contracts.LedgerRecord{
		Operation: contracts.OperationInstance{
			RiskClass: contracts.RiskReversible,
		},
		Compensation: contracts.CompensationDescriptor{
			DescriptorType:    contracts.CompensationType,
			DescriptorVersion: "1",
			BackupRef:         backupFile,
			TargetRef:         targetFile,
			BackupHash:        "incorrect_hash", // Deliberately incorrect hash
		},
	}

	err := compensation.Compensate(record)
	if err == nil {
		t.Fatal("Compensate should have failed due to backup integrity verification, but it did not")
	}
}
