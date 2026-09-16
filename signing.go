package crypto

import (
	"bytes"
	"crypto/ed25519"
	"encoding/hex"
	"fmt"
	"repairer/internal/contracts"
	"strings"
)

// SignRecord signs the hash of a ledger record using a private key.
// It expects the hash to be in the format "sha256:xxxxxxxx".
func SignRecord(recordHash string, privateKey ed25519.PrivateKey) (string, error) {
	hashOnly := strings.TrimPrefix(recordHash, "sha256:")

	hashBytes, err := hex.DecodeString(hashOnly)
	if err != nil {
		return "", fmt.Errorf("invalid record hash for signing: %w", err)
	}
	signature := ed25519.Sign(privateKey, hashBytes)
	return hex.EncodeToString(signature), nil
}

// VerifySignature checks if the signature of a record is valid for a given public key.
// It expects the hash to be in the format "sha256:xxxxxxxx".
func VerifySignature(record contracts.LedgerRecord, publicKey ed25519.PublicKey) (bool, error) {
	if record.Signature.Signature == "" || record.Signature.SignerID == "" {
		return false, fmt.Errorf("record %s is not signed", record.RecordID)
	}

	signerPubKey, err := hex.DecodeString(record.Signature.SignerID)
	if err != nil {
		return false, fmt.Errorf("invalid signer ID format: %w", err)
	}

	if !bytes.Equal(signerPubKey, publicKey) {
		return false, fmt.Errorf("signer ID mismatch")
	}

	sigBytes, err := hex.DecodeString(record.Signature.Signature)
	if err != nil {
		return false, fmt.Errorf("invalid signature format: %w", err)
	}

	hashOnly := strings.TrimPrefix(record.RecordHash, "sha256:")
	hashBytes, err := hex.DecodeString(hashOnly)
	if err != nil {
		return false, fmt.Errorf("invalid record hash for verification: %w", err)
	}

	return ed25519.Verify(publicKey, hashBytes, sigBytes), nil
}
