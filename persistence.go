package ledger

import (
	"encoding/json"
	"fmt"
	"os"
	"repairer/internal/contracts"

	"github.com/gofrs/flock"
)

// AppendRecord marshals a record and appends it to the ledger file using a file lock.
func AppendRecord(ledgerPath string, record contracts.LedgerRecord) error {
	lock := flock.New(ledgerPath)
	err := lock.Lock()
	if err != nil {
		return fmt.Errorf("could not acquire ledger lock: %w", err)
	}
	defer lock.Unlock()

	f, err := os.OpenFile(ledgerPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("could not open ledger file for appending: %w", err)
	}
	defer f.Close()

	recordJSON, err := json.Marshal(record)
	if err != nil {
		return fmt.Errorf("failed to marshal record to JSON: %w", err)
	}

	if _, err := f.WriteString(string(recordJSON) + "\n"); err != nil {
		return fmt.Errorf("failed to write to ledger file: %w", err)
	}

	return nil
}
