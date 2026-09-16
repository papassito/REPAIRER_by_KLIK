package security_test

import (
	"os"
	"path/filepath"
	"repairer/internal/security"
	"runtime"
	"testing"
)

func TestValidatePath(t *testing.T) {
	if runtime.GOOS != "windows" {
		t.Skip("Skipping path validation tests on non-Windows OS")
	}

	// Setup a temporary directory structure for testing.
	// C:\Users\tester\AppData\Local\Temp\testscope123\
	//                                                \data\
	//                                                \database\
	scope := t.TempDir()
	dataDir := filepath.Join(scope, "data")
	databaseDir := filepath.Join(scope, "database")
	os.Mkdir(dataDir, 0755)
	os.Mkdir(databaseDir, 0755)

	testCases := []struct {
		name      string
		path      string
		scope     string
		expectErr bool
	}{
		// Positive Cases
		{"Valid file in scope", filepath.Join(scope, "file.txt"), scope, false},
		{"Valid file in sub-directory", filepath.Join(dataDir, "subfile.txt"), scope, false},
		{"Path is the scope itself", scope, scope, false},

		// Negative Cases: Path Traversal
		{"Path Traversal Up", filepath.Join(scope, "..", "other.txt"), scope, true},
		{"Path Traversal with clean", filepath.Join(scope, "data", "..", "..", "other.txt"), scope, true},

		// Negative Cases: Outside Scope
		{"Completely outside scope", `C:\Windows\System32\drivers\etc\hosts`, scope, true},
		{"Sibling directory", filepath.Join(scope, ".."), scope, true},

		// CRITICAL FIX TEST: `C:\data` vs `C:\database`
		{"Scope prefix but not subdir", databaseDir, dataDir, true},

		// CRITICAL FIX TEST: Non-existent file inside scope (should be allowed)
		{"Non-existent file in scope", filepath.Join(scope, "newfile.txt"), scope, false},
		{"Non-existent file in sub-directory", filepath.Join(dataDir, "newsubfile.txt"), scope, false},

		// Negative Cases: Non-existent parent
		{"Non-existent parent directory", filepath.Join(scope, "nonexistent", "file.txt"), scope, true},

		// Negative Cases: Reserved Names
		{"Reserved name CON", `CON`, scope, true},
		{"Reserved name PRN in path", filepath.Join(scope, "PRN"), scope, true},
		{"Reserved name with extension", `LPT1.txt`, scope, true},

		// Negative Cases: Forbidden Path Types
		{"UNC Path", `\\server\share\file.txt`, scope, true},
		{"Device Path", `\\.\C:\Windows\win.ini`, scope, true},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			err := security.ValidatePath(tc.path, tc.scope)
			if tc.expectErr && err == nil {
				t.Errorf("Expected an error for path '%s' in scope '%s', but got none", tc.path, tc.scope)
			}
			if !tc.expectErr && err != nil {
				t.Errorf("Expected no error for path '%s' in scope '%s', but got: %v", tc.path, tc.scope, err)
			}
		})
	}
}

func TestIsProtectedPath(t *testing.T) {
	if runtime.GOOS != "windows" {
		t.Skip("Skipping protected path tests on non-Windows OS")
	}

	testCases := []struct {
		name      string
		path      string
		expect    bool
		expectErr bool
	}{
		{"Direct protected path", `C:\Windows`, true, false},
		{"Subdir of protected path", `C:\Windows\System32\cmd.exe`, true, false},
		{"Case-insensitive protected path", `c:\windows\system32`, true, false},
		{"Safe path", `C:\Users\test\Documents\file.txt`, false, false},
		{"Path with protected name as prefix", `C:\Windows.old\system.ini`, false, false},
		{"Non-existent but protected", `C:\Windows\nonexistent.dll`, true, false},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			isProtected, err := security.IsProtectedPath(tc.path)

			if tc.expectErr {
				if err == nil {
					t.Errorf("Expected an error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("Expected no error, but got: %v", err)
			}

			if isProtected != tc.expect {
				t.Errorf("Expected protected=%v, but got protected=%v", tc.expect, isProtected)
			}
		})
	}
}
