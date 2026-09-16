package ledger

import (
	"bufio"
	"crypto/ed25519"
	"encoding/json"
	"fmt"
	"os"
	"repairer/internal/contracts"
	"repairer/internal/crypto"
)

// VerifyChain reads an entire ledger file and verifies its integrity.
func VerifyChain(ledgerPath string, verifierKey ed25519.PublicKey) error {
	file, err := os.Open(ledgerPath)
	if err != nil {
		return fmt.Errorf("could not open ledger file: %w", err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	var previousHash string
	var currentSequence int

	for scanner.Scan() {
		line := scanner.Text()
		if line == "" {
			continue
		}

		currentSequence++
		var record contracts.LedgerRecord
		if err := json.Unmarshal([]byte(line), &record); err != nil {
			return fmt.Errorf("corruption at line %d: could not parse JSON: %w", currentSequence, err)
		}

		// Verify sequence
		if record.Sequence != currentSequence {
			return fmt.Errorf("corruption at line %d: sequence mismatch (expected %d, got %d)", currentSequence, currentSequence, record.Sequence)
		}

		// Verify hash chain
		if record.PreviousRecordHash != previousHash {
			return fmt.Errorf("corruption at line %d: hash chain broken", currentSequence)
		}

		// Verify record integrity
		expectedHash, err := HashLedgerRecord(record)
		if err != nil || record.RecordHash != expectedHash {
			return fmt.Errorf("corruption at line %d: record hash mismatch", currentSequence)
		}

		// Verify signature
		if verifierKey != nil {
			if valid, err := crypto.VerifySignature(record, verifierKey); err != nil || !valid {
				return fmt.Errorf("corruption at line %d: invalid signature", currentSequence)
			}
		}

		previousHash = record.RecordHash
	}

	if err := scanner.Err(); err != nil {
		return fmt.Errorf("error reading ledger file: %w", err)
	}

	fmt.Printf("Ledger verification successful. %d records checked.\n", currentSequence)
	return nil
}
