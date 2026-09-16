package security

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

// ProtectedPaths defines a list of critical system directories that should never be modified.
var ProtectedPaths = []string{
	`C:\Windows`,
	`C:\Windows\System32`,
	`C:\ProgramData`,
	`C:\Boot`,
	`C:\Recovery`,
}

// reservedNames contains Windows device names that are forbidden as filenames.
var reservedNames = map[string]bool{
	"CON": true, "PRN": true, "AUX": true, "NUL": true,
	"COM1": true, "COM2": true, "COM3": true, "COM4": true, "COM5": true, "COM6": true, "COM7": true, "COM8": true, "COM9": true,
	"LPT1": true, "LPT2": true, "LPT3": true, "LPT4": true, "LPT5": true, "LPT6": true, "LPT7": true, "LPT8": true, "LPT9": true,
}

// NormalizePath cleans a path using the OS-specific separator and resolves '..' and '.' elements.
func NormalizePath(path string) string {
	return filepath.Clean(path)
}

// IsProtectedPath checks if a given path falls within a list of protected system directories,
// resolving symlinks to prevent bypasses.
func IsProtectedPath(path string) (bool, error) {
	if runtime.GOOS != "windows" {
		return false, nil // This check is currently Windows-specific.
	}

	resolvedPath, err := resolvePath(path)
	if err != nil {
		// If path doesn't exist, we can't resolve its symlinks, but we can still check its intended absolute path.
		absPath, absErr := filepath.Abs(path)
		if absErr != nil {
			return false, fmt.Errorf("could not get absolute path for '%s': %w", path, absErr)
		}
		resolvedPath = absPath
	}

	lowerPath := strings.ToLower(NormalizePath(resolvedPath))

	for _, protected := range ProtectedPaths {
		// Ensure we match the full directory, not a prefix (e.g., C:\Windows vs C:\Windows.old)
		protectedLower := strings.ToLower(NormalizePath(protected))
		if lowerPath == protectedLower || strings.HasPrefix(lowerPath, protectedLower+string(os.PathSeparator)) {
			return true, nil
		}
	}

	return false, nil
}

// ValidatePath ensures that a given path is within an authorized scope.
// It resolves symbolic links and other reparse points to prevent traversal attacks.
func ValidatePath(path string, scope string) error {
	// 1. Basic syntax checks for forbidden path types and names.
	baseName := filepath.Base(path)
	// CRITICAL FIX: Check the name part without extension for reserved names.
	nameOnly := strings.TrimSuffix(baseName, filepath.Ext(baseName))
	if reservedNames[strings.ToUpper(nameOnly)] {
		return fmt.Errorf("path validation failed: uses a reserved device name ('%s')", baseName)
	}
	if strings.HasPrefix(path, `\\.\`) || strings.HasPrefix(path, `\\?\`) {
		return fmt.Errorf("path validation failed: device paths are not allowed ('%s')", path)
	}
	if strings.HasPrefix(path, `\\`) {
		return fmt.Errorf("path validation failed: UNC paths are not allowed ('%s')", path)
	}

	// 2. Resolve scope to its real, absolute, and clean path.
	resolvedScope, err := resolvePath(scope)
	if err != nil {
		return fmt.Errorf("scope '%s' could not be resolved to a real path: %w", scope, err)
	}
	resolvedScope = NormalizePath(resolvedScope)

	// 3. Resolve target path to its real, absolute, and clean path.
	resolvedPath, err := resolvePath(path)
	if err != nil {
		// CRITICAL FIX: If path doesn't exist (e.g., for file creation), resolve its parent and join the base name.
		absPath, absErr := filepath.Abs(path)
		if absErr != nil {
			return fmt.Errorf("could not get absolute path for target '%s': %w", path, absErr)
		}
		parentDir := filepath.Dir(absPath)
		resolvedParent, parentErr := resolvePath(parentDir) // The parent MUST exist.
		if parentErr != nil {
			return fmt.Errorf("parent directory of '%s' could not be resolved: %w", path, parentErr)
		}
		resolvedPath = NormalizePath(filepath.Join(resolvedParent, filepath.Base(absPath)))
	}

	// 4. Perform the final, case-insensitive check on Windows.
	if runtime.GOOS == "windows" {
		resolvedPath = strings.ToLower(resolvedPath)
		resolvedScope = strings.ToLower(resolvedScope)
	}

	// CRITICAL FIX: The scope must be a prefix AND be followed by a path separator or be an exact match.
	// This prevents `C:\data` from matching `C:\database`.
	if resolvedPath != resolvedScope && !strings.HasPrefix(resolvedPath, resolvedScope+string(os.PathSeparator)) {
		return fmt.Errorf("path '%s' is outside the authorized scope '%s'", path, scope)
	}

	return nil
}

// resolvePath resolves a path to its absolute, final location, evaluating symlinks if the path exists.
func resolvePath(path string) (string, error) {
	absPath, err := filepath.Abs(path)
	if err != nil {
		return "", err
	}

	// EvalSymlinks requires the path to exist. If it doesn't, we can't resolve symlinks,
	// but we can still use its absolute path. This is expected for file creation operations.
	if _, statErr := os.Stat(absPath); errors.Is(statErr, os.ErrNotExist) {
		return absPath, nil
	}

	// If the path exists, we MUST resolve symlinks.
	resolved, evalErr := filepath.EvalSymlinks(absPath)
	if evalErr != nil {
		return "", fmt.Errorf("could not resolve symlinks for '%s': %w", path, evalErr)
	}
	return resolved, nil
}
