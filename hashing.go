package ledger

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"repairer/internal/contracts"
)

// HashLedgerRecord computes a SHA-256 hash of a ledger record.
func HashLedgerRecord(record contracts.LedgerRecord) (string, error) {
	recordToHash := record
	recordToHash.RecordHash = ""
	recordToHash.Signature = contracts.LedgerSignature{}

	data, err := json.Marshal(recordToHash)
	if err != nil {
		return "", fmt.Errorf("failed to marshal record for hashing: %w", err)
	}

	hash := sha256.Sum256(data)
	return "sha256:" + hex.EncodeToString(hash[:]), nil
}
