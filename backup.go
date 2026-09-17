package compensation

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"io/fs"
	"path/filepath"
)

type Backup struct {
	Path   string
	SHA256 string
	Size   int64
}

// readRegularFile reads data from a file, ensuring it's not a directory.
func readRegularFile(path string) ([]byte, error) {
	info, err := os.Stat(path)
	if err != nil {
		return nil, err
	}
	if info.IsDir() {
		return nil, fs.ErrInvalid
	}
	return os.ReadFile(path)
}

func PrepareBackup(target, backup string) (Backup, error) {
	if target == "" || backup == "" || filepath.Clean(target) == filepath.Clean(backup) {
		return Backup{}, errors.New("target and backup must be distinct explicit paths")
	}
	data, err := readRegularFile(target)
	if err != nil {
		return Backup{}, fmt.Errorf("read target for backup: %w", err)
	}
	if err := os.MkdirAll(filepath.Dir(backup), 0700); err != nil {
		return Backup{}, fmt.Errorf("create backup directory: %w", err)
	}

	// O_EXCL ensures we don't overwrite an existing backup. This is an atomic check-and-create.
	file, err := os.OpenFile(backup, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0600)
	if err != nil {
		return Backup{}, fmt.Errorf("create backup file: %w", err)
	}

	// Ensure file is closed and removed on any error from this point forward.
	_, writeErr := file.Write(data)
	syncErr := file.Sync()
	closeErr := file.Close()

	if writeErr != nil || syncErr != nil || closeErr != nil {
		os.Remove(backup) // Cleanup on any failure.
		if writeErr != nil {
			return Backup{}, fmt.Errorf("write backup: %w", writeErr)
		}
		if syncErr != nil {
			return Backup{}, fmt.Errorf("sync backup: %w", syncErr)
		}
		return Backup{}, fmt.Errorf("close backup: %w", closeErr)
	}

	// After a successful write, verify the content to protect against write errors.
	verified, err := readRegularFile(backup)
	if err != nil || string(data) != string(verified) {
		os.Remove(backup) // Clean up the invalid backup file.
		if err != nil {
			return Backup{}, fmt.Errorf("backup verification failed on read-back: %w", err)
		}
		return Backup{}, errors.New("backup verification failed: content mismatch")
	}

	hash := sha256.Sum256(verified)
	hexHash := hex.EncodeToString(hash[:])

	return Backup{Path: backup, SHA256: hexHash, Size: int64(len(verified))}, nil
}
