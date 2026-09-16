package core

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

// GenerateKeys creates a new Ed25519 public/private key pair.
func GenerateKeys() (ed25519.PublicKey, ed25519.PrivateKey, error) {
	return ed25519.GenerateKey(rand.Reader)
}

// SignRecord signs the hash of a ledger record using a private key.
func SignRecord(recordHash string, privateKey ed25519.PrivateKey) (string, error) {
	hashBytes, err := hex.DecodeString(recordHash)
	if err != nil {
		return "", fmt.Errorf("invalid record hash for signing: %w", err)
	}
	signature := ed25519.Sign(privateKey, hashBytes)
	return hex.EncodeToString(signature), nil
}

// VerifySignature checks if the signature of a record is valid for a given public key.
func VerifySignature(record LedgerRecord, publicKey ed25519.PublicKey) (bool, error) {
	if record.Signature.Signature == "" || record.Signature.SignerID == "" {
		return false, fmt.Errorf("record %s is not signed", record.RecordID)
	}

	// For this demo, we assume SignerID is the hex-encoded public key.
	// In a real system, this would involve a lookup in a key management system.
	signerPubKey, err := hex.DecodeString(record.Signature.SignerID)
	if err != nil {
		return false, fmt.Errorf("invalid signer ID format: %w", err)
	}
	if !ed25519.PublicKey(signerPubKey).Equal(publicKey) {
		return false, fmt.Errorf("signer ID mismatch")
	}

	sigBytes, err := hex.DecodeString(record.Signature.Signature)
	if err != nil {
		return false, fmt.Errorf("invalid signature format: %w", err)
	}

	hashBytes, err := hex.DecodeString(record.RecordHash)
	if err != nil {
		return false, fmt.Errorf("invalid record hash for verification: %w", err)
	}

	return ed25519.Verify(publicKey, hashBytes, sigBytes), nil
}
