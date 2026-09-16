package core

import (
	"bufio"
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/gofrs/flock"
)

// GetLastRecordHash reads the ledger file, finds the last valid record,
// verifies its integrity, and returns its hash.
// The verifierKey is used to check the signature of the last record.
func GetLastRecordHash(ledgerPath string, verifierKey ed25519.PublicKey) (string, error) {
	// If the file doesn't exist, it's a new ledger with no previous hash.
	_, err := os.Stat(ledgerPath)
	if os.IsNotExist(err) {
		return "", nil // No previous hash for a new ledger.
	}

	file, err := os.Open(ledgerPath)
	if err != nil {
		return "", fmt.Errorf("could not open ledger file: %w", err)
	}
	defer file.Close()

	// Use a scanner to read the file line by line to find the last valid one.
	scanner := bufio.NewScanner(file)
	var lastLine string
	for scanner.Scan() {
		line := scanner.Text()
		if strings.TrimSpace(line) != "" {
			lastLine = line
		}
	}

	if err := scanner.Err(); err != nil {
		return "", fmt.Errorf("error reading ledger file: %w", err)
	}

	// If the file was empty, lastLine will be empty.
	if lastLine == "" {
		return "", nil
	}

	var lastRecord LedgerRecord
	if err := json.Unmarshal([]byte(lastLine), &lastRecord); err != nil {
		return "", fmt.Errorf("could not parse last record in ledger: %w", err)
	}

	// Quick integrity check: re-hash the record and compare.
	// This is a precursor to the full `verify-ledger` command.
	expectedHash, err := HashLedgerRecord(lastRecord)
	if err != nil {
		return "", fmt.Errorf("could not re-hash last record for validation: %w", err)
	}

	if lastRecord.RecordHash != expectedHash {
		return "", fmt.Errorf("ledger corruption detected: last record hash mismatch (expected %s, got %s)", expectedHash, lastRecord.RecordHash)
	}

	// LEDGER-004: Verify the signature of the last record if a key is provided.
	if verifierKey != nil {
		valid, err := VerifySignature(lastRecord, verifierKey)
		if err != nil {
			return "", fmt.Errorf("error verifying signature of last record: %w", err)
		}
		if !valid {
			return "", fmt.Errorf("ledger corruption detected: last record has an invalid signature")
		}
	}

	return lastRecord.RecordHash, nil
}

// AppendLedger marshals a record and appends it to the ledger file using a file lock
// to ensure safe concurrent access.
func AppendLedger(ledgerPath string, record LedgerRecord) error {
	// Use flock for file locking to prevent concurrent writes.
	lock := flock.New(ledgerPath)
	err := lock.Lock()
	if err != nil {
		return fmt.Errorf("could not acquire ledger lock: %w", err)
	}
	defer lock.Unlock()

	// Open the file in append mode, create if it doesn't exist.
	f, err := os.OpenFile(ledgerPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("could not open ledger file for appending: %w", err)
	}
	defer f.Close()

	recordJSON, err := json.Marshal(record)
	if err != nil {
		return fmt.Errorf("failed to marshal record to JSON: %w", err)
	}

	// Write the JSON record followed by a newline to make it a JSONL file.
	if _, err := f.WriteString(string(recordJSON) + "\n"); err != nil {
		return fmt.Errorf("failed to write to ledger file: %w", err)
	}

	return nil
}

// HashLedgerRecord computes a SHA-256 hash of a ledger record.
// It temporarily blanks the RecordHash field to ensure the hash is computed
// on the content of the record, not on its own hash.
func HashLedgerRecord(record LedgerRecord) (string, error) {
	recordToHash := record
	recordToHash.RecordHash = ""               // Exclude the hash itself from being hashed.
	recordToHash.Signature = LedgerSignature{} // Exclude the signature from being hashed.

	data, err := json.Marshal(recordToHash)
	if err != nil {
		return "", fmt.Errorf("failed to marshal record for hashing: %w", err)
	}

	hash := sha256.Sum256(data)
	return hex.EncodeToString(hash[:]), nil
}
