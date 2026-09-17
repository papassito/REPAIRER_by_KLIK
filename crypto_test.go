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

	otherPubKey, _, _ := crypto.LoadOrGenerateKeys(filepath.Join(t.TempDir(), "other.key"))
	recordHash := "sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
	signature, err := crypto.SignRecord(recordHash, privKey)
	if err != nil {
		t.Fatalf("SignRecord failed: %v", err)
	}
	record := contracts.LedgerRecord{RecordHash: recordHash, Signature: contracts.LedgerSignature{Signature: signature}}

	if ok, err := crypto.VerifySignature(record, pubKey); err != nil || !ok {
		t.Errorf("Verification with correct key failed. ok=%v, err=%v", ok, err)
	}
	if ok, _ := crypto.VerifySignature(record, otherPubKey); ok {
		t.Error("Verification with incorrect key succeeded, but should have failed.")
	}
}