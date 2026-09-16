package ledger_test

import (
	"os"
	"path/filepath"
	"repairer/internal/contracts"
	"repairer/internal/crypto"
	"repairer/internal/ledger"
	"testing"
)

func createTestLedger(t *testing.T, path string, records []contracts.LedgerRecord) {
	f, err := os.Create(path)
	if err != nil {
		t.Fatalf("Failed to create test ledger file: %v", err)
	}
	defer f.Close()

	for _, rec := range records {
		if err := ledger.AppendRecord(path, rec); err != nil {
			t.Fatalf("Failed to append record: %v", err)
		}
	}
}

func TestVerifyChain(t *testing.T) {
	pubKey, privKey, err := crypto.LoadOrGenerateKeys(filepath.Join(t.TempDir(), "test.key"))
	if err != nil {
		t.Fatalf("Failed to generate keys: %v", err)
	}

	// Create a valid chain of 2 records
	rec1 := contracts.LedgerRecord{RecordID: "rec-1", Sequence: 1, PreviousRecordHash: ""}
	hash1, _ := ledger.HashLedgerRecord(rec1)
	rec1.RecordHash = hash1
	sig1, _ := crypto.SignRecord(hash1, privKey)
	rec1.Signature.Signature = sig1

	rec2 := contracts.LedgerRecord{RecordID: "rec-2", Sequence: 2, PreviousRecordHash: hash1}
	hash2, _ := ledger.HashLedgerRecord(rec2)
	rec2.RecordHash = hash2
	sig2, _ := crypto.SignRecord(hash2, privKey)
	rec2.Signature.Signature = sig2

	t.Run("Valid Chain", func(t *testing.T) {
		ledgerPath := filepath.Join(t.TempDir(), "valid.ledger")
		createTestLedger(t, ledgerPath, []contracts.LedgerRecord{rec1, rec2})
		err := ledger.VerifyChain(ledgerPath, pubKey)
		if err != nil {
			t.Errorf("VerifyChain failed on a valid ledger: %v", err)
		}
	})

	t.Run("Broken Hash Chain", func(t *testing.T) {
		ledgerPath := filepath.Join(t.TempDir(), "broken_hash.ledger")
		rec2_corrupted := rec2
		rec2_corrupted.PreviousRecordHash = "sha256:tampered"
		createTestLedger(t, ledgerPath, []contracts.LedgerRecord{rec1, rec2_corrupted})
		err := ledger.VerifyChain(ledgerPath, pubKey)
		if err == nil {
			t.Error("VerifyChain should have failed on a broken hash chain, but it did not")
		}
	})

	t.Run("Broken Sequence", func(t *testing.T) {
		ledgerPath := filepath.Join(t.TempDir(), "broken_seq.ledger")
		rec2_corrupted := rec2
		rec2_corrupted.Sequence = 99 // Corrupt sequence
		createTestLedger(t, ledgerPath, []contracts.LedgerRecord{rec1, rec2_corrupted})
		err := ledger.VerifyChain(ledgerPath, pubKey)
		if err == nil {
			t.Error("VerifyChain should have failed on a broken sequence, but it did not")
		}
	})

	t.Run("Invalid Signature", func(t *testing.T) {
		ledgerPath := filepath.Join(t.TempDir(), "invalid_sig.ledger")
		rec2_corrupted := rec2
		rec2_corrupted.Signature.Signature = "invalid"
		createTestLedger(t, ledgerPath, []contracts.LedgerRecord{rec1, rec2_corrupted})
		err := ledger.VerifyChain(ledgerPath, pubKey)
		if err == nil {
			t.Error("VerifyChain should have failed on an invalid signature, but it did not")
		}
	})
}
