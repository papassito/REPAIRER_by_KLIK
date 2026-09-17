package security

import (
	"runtime"
	"testing"
)

func TestValidateSafePath(t *testing.T) {
	baseDir := "./backups"

	tests := []struct {
		name        string
		target      string
		expectError bool
		isWindowsOnly bool
	}{
		{
			name:        "Ruta válida estándar",
			target:      "./backups/2026-09-16.json",
			expectError: false,
		},
		{
			name:        "Salto de directorio (Path Traversal)",
			target:      "./backups/../../etc/passwd",
			expectError: true,
		},
		{
			name:        "Nombre reservado simple (CON)",
			target:      "./backups/CON.txt",
			expectError: true,
		},
		{
			name:        "Nombre reservado en extensión compuesta (my.CON.txt)",
			target:      "./backups/my.CON.txt",
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Si la prueba es exclusiva de Windows y no estamos en Windows, la omitimos de forma segura
			if tt.isWindowsOnly && runtime.GOOS != "windows" {
				t.Skip("Prueba omitida: entorno no Windows")
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