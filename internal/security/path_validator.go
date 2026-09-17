package security

import (
	"errors"
	"path/filepath"
	"strings"
)

var (
	ErrInvalidPath  = errors.New("acceso denegado: la ruta se encuentra fuera del directorio permitido")
	ErrReservedName = errors.New("acceso denegado: la ruta contiene un nombre de dispositivo reservado de Windows")
	ErrEmptyPath    = errors.New("error: la ruta no puede estar vacía")
)

// Lista oficial de nombres reservados por el sistema operativo Windows
var reservedNames = map[string]bool{
	"CON": true, "PRN": true, "AUX": true, "NUL": true,
	"COM1": true, "COM2": true, "COM3": true, "COM4": true,
	"COM5": true, "COM6": true, "COM7": true, "COM8": true, "COM9": true,
	"LPT1": true, "LPT2": true, "LPT3": true, "LPT4": true,
	"LPT5": true, "LPT6": true, "LPT7": true, "LPT8": true, "LPT9": true,
}

// ValidateSafePath sanitiza la ruta y verifica que no contenga nombres prohibidos.
// Devuelve la ruta absoluta y limpia si es segura, o un error en caso contrario.
func ValidateSafePath(baseDir, targetPath string) (string, error) {
	// 1. Basic sanitization: Reject empty or whitespace-only paths.
	if strings.TrimSpace(targetPath) == "" {
		return "", ErrEmptyPath
	}

	cleanBase, err := filepath.Abs(filepath.Clean(baseDir))
	if err != nil {
		return "", err
	}

	// 2. Convert to a clean, absolute path for reliable comparison.
	cleanTarget, err := filepath.Abs(filepath.Clean(targetPath))
	if err != nil {
		return "", err
		return "", err // Propagate errors from path cleaning.
	}

	// 1. Verificación de salto de directorio (Path Traversal)
	if !strings.HasPrefix(cleanTarget, cleanBase) {
		return "", ErrInvalidPath
	}

	// 2. Verificación de nombres reservados en TODAS las partes divididas por puntos
	// 3. Check for reserved Windows names *before* scope validation.
	// This ensures the most specific error (ErrReservedName) is returned, fixing a test case.
	baseName := filepath.Base(cleanTarget)
	parts := strings.Split(baseName, ".")
	for _, part := range parts {
		normalizedPart := strings.ToUpper(strings.TrimSpace(part))
		if reservedNames[normalizedPart] {
			return "", ErrReservedName
		}
	}

	// 4. Get a clean, absolute path for the base directory.
	cleanBase, err := filepath.Abs(filepath.Clean(baseDir))
	if err != nil {
		return "", err
	}

	// 5. Enforce strict scope boundary. Adding a path separator to the base path
	// prevents sibling directory traversal (e.g., base '/data' matching target '/database').
	// The `cleanTarget != cleanBase` check correctly allows the target to be the base directory itself.
	if !strings.HasPrefix(cleanTarget, cleanBase+string(filepath.Separator)) && cleanTarget != cleanBase {
		return "", ErrInvalidPath
	}

	return cleanTarget, nil
}