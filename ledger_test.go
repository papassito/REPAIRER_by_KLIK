package ledger_test

import (
	"path/filepath"
	"repairer/internal/contracts"
	"repairer/internal/crypto"
	"repairer/internal/ledger"
	"testing"
	"time"
)

func TestHashLedgerRecord(t *testing.T) {
	record := contracts.LedgerRecord{
		RecordID:   "rec-001",
		Sequence:   1,
		RecordHash: "should_be_ignored",
		Signature: contracts.LedgerSignature{
			SignerID:  "signer",
			Signature: "should_also_be_ignored",
		},
	}

	hash1, err := ledger.HashLedgerRecord(record)
	if err != nil {
		t.Fatalf("HashLedgerRecord failed: %v", err)
	}

	// Modify a non-hashed field
	record.RecordHash = "changed"
	hash2, _ := ledger.HashLedgerRecord(record)

	if hash1 != hash2 {
		t.Error("Hashing should be deterministic and ignore the RecordHash field")
	}

	// Modify a hashed field
	record.Sequence = 2
	hash3, _ := ledger.HashLedgerRecord(record)

	if hash1 == hash3 {
		t.Error("Changing a record field did not change the hash")
	}
}

func TestAppendAndGetLastHash(t *testing.T) {
	// 1. Setup
	ledgerPath := filepath.Join(t.TempDir(), "test.ledger.jsonl")
	pubKey, _, err := crypto.LoadOrGenerateKeys(filepath.Join(t.TempDir(), "test.key"))
	if err != nil {
		t.Fatalf("Failed to generate keys: %v", err)
	}

	// 2. Test on empty/new ledger
	lastHash, err := ledger.GetLastRecordHash(ledgerPath, pubKey)
	if err != nil {
		t.Fatalf("GetLastRecordHash on new ledger failed: %v", err)
	}
	if lastHash != "" {
		t.Errorf("Expected empty hash for new ledger, got '%s'", lastHash)
	}

	// 3. Append first record
	record1 := contracts.LedgerRecord{
		RecordID:           "rec-001",
		Sequence:           1,
		RecordedAt:         time.Now().UTC().Format(time.RFC3339),
		PreviousRecordHash: "", // First record
	}
	hash1, _ := ledger.HashLedgerRecord(record1)
	record1.RecordHash = hash1
	// In a real scenario, we would sign it here. For this test, we skip it.

	err = ledger.AppendRecord(ledgerPath, record1)
	if err != nil {
		t.Fatalf("AppendRecord for first record failed: %v", err)
	}

	// 4. Verify first record
	lastHash, err = ledger.GetLastRecordHash(ledgerPath, nil) // Pass nil key to skip signature check
	if err != nil {
		t.Fatalf("GetLastRecordHash after first append failed: %v", err)
	}
	if lastHash != hash1 {
		t.Errorf("Expected hash '%s', got '%s'", hash1, lastHash)
	}

	// 5. Append second record
	record2 := contracts.LedgerRecord{
		RecordID:           "rec-002",
		Sequence:           2,
		RecordedAt:         time.Now().UTC().Format(time.RFC3339),
		PreviousRecordHash: hash1, // Chain to the first record
	}
	hash2, _ := ledger.HashLedgerRecord(record2)
	record2.RecordHash = hash2

	err = ledger.AppendRecord(ledgerPath, record2)
	if err != nil {
		t.Fatalf("AppendRecord for second record failed: %v", err)
	}

	// 6. Verify second record
	lastHash, err = ledger.GetLastRecordHash(ledgerPath, nil)
	if err != nil || lastHash != hash2 {
		t.Errorf("GetLastRecordHash after second append failed. Expected '%s', got '%s' (err: %v)", hash2, lastHash, err)
	}
}
