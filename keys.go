package crypto

import (
	"crypto/ed25519"
	"errors"
	"fmt"
	"os"
)

// LoadOrGenerateKeys handles basic but REAL key persistence for the prototype.
func LoadOrGenerateKeys(keyPath string) (ed25519.PublicKey, ed25519.PrivateKey, error) {
	if _, err := os.Stat(keyPath); os.IsNotExist(err) {
		fmt.Println("[*] No existing key found. Generating new key pair...")
		publicKey, privateKey, err := ed25519.GenerateKey(nil) // Use default rand.Reader
		if err != nil {
			return nil, nil, err
		}
		// The key file format is 32 bytes of public key + 64 bytes of private key.
		keyData := append(publicKey, privateKey...)
		if err := os.WriteFile(keyPath, keyData, 0600); err != nil {
			return nil, nil, fmt.Errorf("failed to write new key file: %w", err)
		}
		return publicKey, privateKey, nil
	}

	fmt.Println("[*] Loading existing key from file...")
	keyData, err := os.ReadFile(keyPath)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to read key file: %w", err)
	}

	if len(keyData) != ed25519.PublicKeySize+ed25519.PrivateKeySize {
		return nil, nil, errors.New("invalid key file size")
	}

	publicKey := ed25519.PublicKey(keyData[:ed25519.PublicKeySize])
	privateKey := ed25519.PrivateKey(keyData[ed25519.PublicKeySize:])

	return publicKey, privateKey, nil
}
