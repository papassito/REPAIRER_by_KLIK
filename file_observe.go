package operations

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"repairer/internal/contracts"
	"repairer/internal/security"
)

// FileObserveHandler implements the logic for the "file.observe" operation.
type FileObserveHandler struct{}

func (h *FileObserveHandler) Execute(op contracts.OperationInstance, authorizedScope string) (*contracts.LedgerRecord, error) {
	if op.RiskClass != contracts.RiskReadOnly {
		return nil, errors.New("file.observe must be a READ_ONLY operation")
	}
	targetFile := op.TargetRef
	if targetFile == "" {
		return nil, errors.New("missing 'target_ref' for file.observe")
	}

	// TOCTOU Mitigation: Re-validate path immediately before use.
	if err := security.ValidatePath(targetFile, authorizedScope); err != nil {
		return nil, fmt.Errorf("pre-read path re-validation failed: %w", err)
	}

	fmt.Printf("[*] Observing file: %s\n", targetFile)
	data, err := os.ReadFile(targetFile)
	if err != nil {
		return &contracts.LedgerRecord{
			EventType: "OPERATION_COMPLETED",
			Operation: op,
			Outcome:   contracts.OperationOutcome{Status: "FAILED_NO_CHANGE", Changed: false},
		}, nil
	}

	hash := sha256.Sum256(data)
	fileHash := hex.EncodeToString(hash[:])
	fmt.Printf(" [+] File observed. Hash: %s\n", fileHash)

	return &contracts.LedgerRecord{
		EventType: "OPERATION_COMPLETED",
		Operation: op,
		Outcome:   contracts.OperationOutcome{Status: "SUCCEEDED_VERIFIED", Changed: false},
	}, nil
}
