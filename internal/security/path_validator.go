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

// Dispositivos reservados del sistema operativo Windows.
var reservedNames = map[string]bool{
	"CON": true, "PRN": true, "AUX": true, "NUL": true,
	"COM1": true, "COM2": true, "COM3": true, "COM4": true,
	"COM5": true, "COM6": true, "COM7": true, "COM8": true, "COM9": true,
	"LPT1": true, "LPT2": true, "LPT3": true, "LPT4": true,
	"LPT5": true, "LPT6": true, "LPT7": true, "LPT8": true, "LPT9": true,
}

// ValidateSafePath verifica que la ruta sea segura y no contenga nombres reservados.
func ValidateSafePath(baseDir, targetPath string) (string, error) {
	if strings.TrimSpace(targetPath) == "" {
		return "", ErrEmptyPath
	}

	cleanBase, err := filepath.Abs(filepath.Clean(baseDir))
	if err != nil {
		return "", err
	}

	cleanTarget, err := filepath.Abs(filepath.Clean(targetPath))
	if err != nil {
		return "", err
	}

	if !strings.HasPrefix(cleanTarget, cleanBase) {
		return "", ErrInvalidPath
	}

	// Extraemos el nombre base del archivo
	baseName := filepath.Base(cleanTarget)

	// Dividimos por puntos para revisar CADA segmento del nombre del archivo
	// Ejemplo: "my.CON.txt" -> ["my", "CON", "txt"]
	parts := strings.Split(baseName, ".")
	for _, part := range parts {
		normalizedPart := strings.ToUpper(strings.TrimSpace(part))
		if reservedNames[normalizedPart] {
			return "", ErrReservedName
		}
	}

	return cleanTarget, nil
}