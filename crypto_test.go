package crypto_test

import (
	"os"
	"path/filepath"
	"repairer/internal/contracts"
	"repairer/internal/crypto"
	"testing"
)

func TestLoadOrGenerateKeys(t *testing.T) {
	keyPath := filepath.Join(t.TempDir(), "test.key")

	// First call: generate keys
	pub1, priv1, err := crypto.LoadOrGenerateKeys(keyPath)
	if err != nil {
		t.Fatalf("First call to LoadOrGenerateKeys failed: %v", err)
	}
	if _, err := os.Stat(keyPath); os.IsNotExist(err) {
		t.Fatal("Key file was not created on first call")
	}

	// Second call: load keys
	pub2, priv2, err := crypto.LoadOrGenerateKeys(keyPath)
	if err != nil {
		t.Fatalf("Second call to LoadOrGenerateKeys failed: %v", err)
	}

	// Verify that the loaded keys are the same as the generated ones
	if !pub1.Equal(pub2) {
		t.Error("Loaded public key does not match generated public key")
	}
	if !priv1.Equal(priv2) {
		t.Error("Loaded private key does not match generated private key")
	}
}

func TestSignAndVerifySignature(t *testing.T) {
	// 1. Setup
	pubKey, privKey, err := crypto.LoadOrGenerateKeys(filepath.Join(t.TempDir(), "test.key"))
	if err != nil {
		t.Fatalf("Failed to generate keys for test: %v", err)
	}

	// A different key pair to test failure cases
	otherPubKey, _, _ := crypto.LoadOrGenerateKeys(filepath.Join(t.TempDir(), "other.key"))

	recordHash := "sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

	// 2. Sign the record
	signature, err := crypto.SignRecord(recordHash, privKey)
	if err != nil {
		t.Fatalf("SignRecord failed: %v", err)
	}

	// 3. Create a signed ledger record
	record := contracts.LedgerRecord{
		RecordHash: recordHash,
		Signature: contracts.LedgerSignature{
			SignerID:  "some_signer", // SignerID is not validated in this unit test
			Signature: signature,
		},
	}

	// 4. Test verification
	// Positive case: should succeed
	valid, err := crypto.VerifySignature(record, pubKey)
	if err != nil || !valid {
		t.Errorf("Verification with correct key failed. valid=%v, err=%v", valid, err)
	}

	// Negative case: should fail with wrong key
	invalid, err := crypto.VerifySignature(record, otherPubKey)
	if err == nil && invalid {
		t.Error("Verification with incorrect key succeeded, but should have failed.")
	}
}
