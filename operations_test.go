package operations_test

import (
	"os"
	"path/filepath"
	"repairer/internal/contracts"
	"repairer/internal/operations"
	"runtime"
	"testing"
)

func TestRegistry(t *testing.T) {
	reg := operations.NewRegistry()
	handler := &operations.FileObserveHandler{}

	reg.Register("test.op", handler)

	// Test successful retrieval
	retrieved, err := reg.Get("test.op")
	if err != nil {
		t.Fatalf("Get failed for a registered operation: %v", err)
	}
	if retrieved != handler {
		t.Error("Retrieved handler does not match the registered one")
	}

	// Test retrieval of unknown operation
	_, err = reg.Get("unknown.op")
	if err == nil {
		t.Fatal("Get should have failed for an unknown operation, but it did not")
	}
}

func TestFileObserveHandler(t *testing.T) {
	scope := t.TempDir()
	existingFile := filepath.Join(scope, "exists.txt")
	nonExistentFile := filepath.Join(scope, "nonexistent.txt")
	outsideFile := filepath.Join(t.TempDir(), "outside.txt") // A different temp dir

	os.WriteFile(existingFile, []byte("content"), 0644)
	os.WriteFile(outsideFile, []byte("content"), 0644)

	handler := &operations.FileObserveHandler{}

	t.Run("Observe existing file", func(t *testing.T) {
		op := contracts.OperationInstance{
			RiskClass: contracts.RiskReadOnly,
			TargetRef: existingFile,
		}
		record, err := handler.Execute(op, scope)
		if err != nil {
			t.Fatalf("Execute failed unexpectedly: %v", err)
		}
		if record.Outcome.Status != "SUCCEEDED_VERIFIED" {
			t.Errorf("Expected status SUCCEEDED_VERIFIED, got %s", record.Outcome.Status)
		}
	})

	t.Run("Observe non-existent file", func(t *testing.T) {
		op := contracts.OperationInstance{
			RiskClass: contracts.RiskReadOnly,
			TargetRef: nonExistentFile,
		}
		record, err := handler.Execute(op, scope)
		if err != nil {
			t.Fatalf("Execute failed unexpectedly: %v", err)
		}
		if record.Outcome.Status != "FAILED_NO_CHANGE" {
			t.Errorf("Expected status FAILED_NO_CHANGE, got %s", record.Outcome.Status)
		}
	})

	t.Run("Observe file outside scope", func(t *testing.T) {
		op := contracts.OperationInstance{
			RiskClass: contracts.RiskReadOnly,
			TargetRef: outsideFile,
		}
		_, err := handler.Execute(op, scope)
		if err == nil {
			t.Fatal("Execute should have failed for a path outside the scope, but it did not")
		}
	})
}

func TestFileCleanHandler(t *testing.T) {
	scope := t.TempDir()
	targetFile := filepath.Join(scope, "target.txt")
	backupFile := filepath.Join(scope, "target.bak")

	os.WriteFile(targetFile, []byte("dirty content"), 0644)

	handler := &operations.FileCleanHandler{}

	op := contracts.OperationInstance{
		RiskClass: contracts.RiskReversible,
		TargetRef: targetFile,
		Parameters: map[string]string{
			"backup_ref": backupFile,
		},
	}

	record, err := handler.Execute(op, scope)
	if err != nil {
		t.Fatalf("Execute failed unexpectedly: %v", err)
	}

	if record.Outcome.Status != "SUCCEEDED_VERIFIED" {
		t.Fatalf("Expected status SUCCEEDED_VERIFIED, got %s", record.Outcome.Status)
	}

	// Verify file content
	content, _ := os.ReadFile(targetFile)
	expectedContent := "127.0.0.1 localhost\n"
	if string(content) != expectedContent {
		t.Errorf("File content was not cleaned. Expected '%s', got '%s'", expectedContent, string(content))
	}

	// Verify backup exists
	if _, err := os.Stat(backupFile); os.IsNotExist(err) {
		t.Error("Backup file was not created")
	}
}

func TestFileCleanHandler_WriteFail(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("Skipping read-only file test on Windows due to complexity of setting permissions.")
	}
	scope := t.TempDir()
	targetFile := filepath.Join(scope, "readonly.txt")
	backupFile := filepath.Join(scope, "readonly.bak")
	os.WriteFile(targetFile, []byte("content"), 0644)
	os.Chmod(targetFile, 0444) // Make it read-only

	handler := &operations.FileCleanHandler{}
	op := contracts.OperationInstance{
		RiskClass: contracts.RiskReversible,
		TargetRef: targetFile,
		Parameters: map[string]string{
			"backup_ref": backupFile,
		},
	}

	record, err := handler.Execute(op, scope)
	if err != nil {
		t.Fatalf("Execute on read-only file should not return a direct error, but got: %v", err)
	}
	if record.Outcome.Status != "FAILED_PARTIAL" {
		t.Errorf("Expected status FAILED_PARTIAL for write failure, got %s", record.Outcome.Status)
	}
}
