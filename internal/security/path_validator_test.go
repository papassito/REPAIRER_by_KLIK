package security_test

import (
	"os"
	"path/filepath"
	"repairer/internal/security"
	"runtime"
	"testing"
)

func TestValidateSafePath(t *testing.T) {
	if runtime.GOOS != "windows" {
		t.Skip("Skipping path validation tests on non-Windows OS")
	}

	scope := t.TempDir()
	dataDir := filepath.Join(scope, "data")
	databaseDir := filepath.Join(scope, "database")
	os.Mkdir(dataDir, 0755)
	os.Mkdir(databaseDir, 0755)

	testCases := []struct {
		name      string
		baseDir   string
		targetPath string
		expectErr bool
		errType   error
	}{
		// Positive Cases
		{"Valid file in scope", scope, filepath.Join(scope, "file.txt"), false, nil},
		{"Valid file in sub-directory", scope, filepath.Join(dataDir, "subfile.txt"), false, nil},
		{"Path is the scope itself", scope, scope, false, nil},
		{"Non-existent file in scope", scope, filepath.Join(scope, "newfile.txt"), false, nil},

		// Negative Cases: Path Traversal
		{"Path Traversal Up", scope, filepath.Join(scope, "..", "other.txt"), true, security.ErrInvalidPath},
		{"Path Traversal with clean", scope, filepath.Join(scope, "data", "..", "..", "other.txt"), true, security.ErrInvalidPath},

		// Negative Cases: Outside Scope
		{"Completely outside scope", scope, `C:\Windows\System32\drivers\etc\hosts`, true, security.ErrInvalidPath},
		{"Sibling directory", scope, filepath.Join(scope, ".."), true, security.ErrInvalidPath},
		{"Scope prefix but not subdir", dataDir, databaseDir, true, security.ErrInvalidPath},

		// Negative Cases: Reserved Names
		{"Reserved name CON", scope, `CON`, true, security.ErrReservedName},
		{"Reserved name PRN in path", scope, filepath.Join(scope, "PRN"), true, security.ErrReservedName},
		{"Reserved name with extension", scope, `LPT1.txt`, true, security.ErrReservedName},

		// Negative Cases: Empty Path
		{"Empty target path", scope, "  ", true, security.ErrEmptyPath},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := security.ValidateSafePath(tc.baseDir, tc.targetPath)

			if tc.expectErr {
				if err == nil {
					t.Errorf("Expected an error for path '%s' in scope '%s', but got none", tc.targetPath, tc.baseDir)
				} else if tc.errType != nil && err != tc.errType {
					t.Errorf("Expected error type %v, but got %v", tc.errType, err)
				}
			} else {
				if err != nil {
					t.Errorf("Expected no error for path '%s' in scope '%s', but got: %v", tc.targetPath, tc.baseDir, err)
				}
			}
		})
	}
}