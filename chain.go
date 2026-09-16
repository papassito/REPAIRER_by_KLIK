package ledger

import (
	"bufio"
	"crypto/ed25519"
	"encoding/json"
	"fmt"
	"os"
	"repairer/internal/contracts"
	"repairer/internal/crypto"
	"strings"
)

// GetLastRecordHash reads the ledger file, finds the last valid record,
// verifies its integrity, and returns its hash.
func GetLastRecordHash(ledgerPath string, verifierKey ed25519.PublicKey) (string, error) {
	_, err := os.Stat(ledgerPath)
	if os.IsNotExist(err) {
		return "", nil // No previous hash for a new ledger.
	}

	file, err := os.Open(ledgerPath)
	if err != nil {
		return "", fmt.Errorf("could not open ledger file: %w", err)
	}
	defer file.Close()

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

	if lastLine == "" {
		return "", nil
	}

	var lastRecord contracts.LedgerRecord
	if err := json.Unmarshal([]byte(lastLine), &lastRecord); err != nil {
		return "", fmt.Errorf("could not parse last record in ledger: %w", err)
	}

	expectedHash, err := HashLedgerRecord(lastRecord)
	if err != nil || lastRecord.RecordHash != expectedHash {
		return "", fmt.Errorf("ledger corruption detected: last record hash mismatch")
	}

	if verifierKey != nil {
		if valid, err := crypto.VerifySignature(lastRecord, verifierKey); err != nil || !valid {
			return "", fmt.Errorf("ledger corruption detected: last record has an invalid signature")
		}
	}

	return lastRecord.RecordHash, nil
}
