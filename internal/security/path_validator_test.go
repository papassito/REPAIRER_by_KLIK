package security

import (
	"runtime"
	"testing"
)

func TestValidateSafePath(t *testing.T) {
	baseDir := "./backups"

	tests := []struct {
		name          string
		target        string
		expectError   bool
		isWindowsOnly bool
	}{
		{
			name:          "Ruta válida estándar",
			target:        "./backups/2026-09-16.json",
			expectError:   false,
			isWindowsOnly: false,
		},
		{
			name:          "Salto de directorio (Path Traversal)",
			target:        "./backups/../../etc/passwd",
			expectError:   true,
			isWindowsOnly: false,
		},
		{
			name:          "Nombre reservado simple (CON)",
			target:        "./backups/CON.txt",
			expectError:   true,
			isWindowsOnly: true,
		},
		{
			name:          "Nombre reservado en extensión compuesta (my.CON.txt)",
			target:        "./backups/my.CON.txt",
			expectError:   true,
			isWindowsOnly: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.isWindowsOnly && runtime.GOOS != "windows" {
				t.Skip("Prueba omitida: solo para Windows")
			}

			_, err := ValidateSafePath(baseDir, tt.target)

			if tt.expectError && err == nil {
				t.Errorf("Se esperaba un error para '%s', pero no se generó ninguno", tt.target)
			}
			if !tt.expectError && err != nil {
				t.Errorf("No se esperaba error para '%s', pero se obtuvo: %v", tt.target, err)
			}
		})
	}
}