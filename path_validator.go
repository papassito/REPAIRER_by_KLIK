package security

import (
	"fmt"
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
		// If path doesn't exist, we can't resolve it, but we can still check its intended absolute path.
		absPath, absErr := filepath.Abs(path)
		if absErr != nil {
			return false, fmt.Errorf("could not get absolute path for '%s': %w", path, absErr)
		}
		resolvedPath = absPath
	}

	lowerPath := strings.ToLower(resolvedPath)

	for _, protected := range ProtectedPaths {
		if strings.HasPrefix(lowerPath, strings.ToLower(protected)) {
			return true, nil
		}
	}

	return false, nil
}

// ValidatePath ensures that a given path is within an authorized scope.
// It resolves symbolic links and other reparse points to prevent traversal attacks.
func ValidatePath(path string, scope string) error {
	// 1. Basic syntax checks for forbidden path types.
	if strings.HasPrefix(path, `\\.\`) || strings.HasPrefix(path, `\\?\`) {
		return fmt.Errorf("path validation failed: device paths are not allowed ('%s')", path)
	}
	if strings.HasPrefix(path, `\\`) {
		return fmt.Errorf("path validation failed: UNC paths are not allowed ('%s')", path)
	}

	// 2. Resolve scope to its real, absolute path.
	resolvedScope, err := resolvePath(scope)
	if err != nil {
		return fmt.Errorf("scope '%s' could not be resolved to a real path: %w", scope, err)
	}

	// 3. Resolve target path to its real, absolute path.
	resolvedPath, err := resolvePath(path)
	if err != nil {
		// If path doesn't exist (e.g., for file creation), resolve its parent and join the base name.
		absPath, absErr := filepath.Abs(path)
		if absErr != nil {
			return fmt.Errorf("could not get absolute path for target '%s': %w", path, absErr)
		}
		parentDir := filepath.Dir(absPath)
		resolvedParent, parentErr := resolvePath(parentDir)
		if parentErr != nil {
			return fmt.Errorf("parent directory of '%s' could not be resolved: %w", path, parentErr)
		}
		resolvedPath = filepath.Join(resolvedParent, filepath.Base(absPath))
	}

	// 4. Perform the final, case-insensitive check on Windows.
	if runtime.GOOS == "windows" {
		resolvedPath = strings.ToLower(resolvedPath)
		resolvedScope = strings.ToLower(resolvedScope)
	}

	if !strings.HasPrefix(resolvedPath, resolvedScope) {
		return fmt.Errorf("path '%s' is outside the authorized scope '%s'", path, scope)
	}

	return nil
}

// resolvePath resolves a path to its absolute, final location, evaluating symlinks.
func resolvePath(path string) (string, error) {
	absPath, err := filepath.Abs(path)
	if err != nil {
		return "", err
	}

	// EvalSymlinks requires the path to exist to resolve it.
	resolved, err := filepath.EvalSymlinks(absPath)
	if err != nil {
		return "", fmt.Errorf("could not resolve symlinks for '%s': %w", path, err)
	}
	return resolved, nil
}
