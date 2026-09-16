package core

import (
	"context"
	"fmt"
	"strings"
)

// App struct holds the application's state and logic.
// It's the Go equivalent of the RepairerContext.
type App struct {
	ctx context.Context
	// TODO: Add state for Windows diagnostics.
}

// NewApp creates a new App application struct.
func NewApp() *App {
	return &App{}
}

// OnStartup is a lifecycle method called when the app starts.
func (a *App) OnStartup(ctx context.Context) {
	a.ctx = ctx
	// TODO: Load initial state, if any.
}

// ExecuteSystemCommand is a placeholder for the secure command execution engine (SEC-003).
// This is a PROTOTYPE and does not yet call real Windows APIs.
func (a *App) ExecuteSystemCommand(cmd string) (string, error) {
	trimmedCmd := strings.TrimSpace(cmd)

	// PROTOTYPE: This allowlist should be part of a formal, versioned Operation Catalog.
	allowedCommands := map[string]string{
		"sys.get_os_info":             "OS: Windows 11 Workstation \nBuild: 22631\nArch: amd64\nKernel: Windows NT",
		"sys.get_services":            "Services:\n  Spooler: STOPPED\n  WinDefend: RUNNING\n  wuauserv: RUNNING",
		"sys.get_registry_status":     "Registry state:\n  HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows: OK\n  UAC: ACTIVE",
		"sys.get_file_hashes":         "Hosts File: CORRUPTED (redirection hosts active)\nExpected Hash: 4b227777d4dd...\nObserved Hash: c3a9238e81d1...",
		"sys.get_disk_health":         "Disk status:\n  Drive C:\\ NVMe healthy (98% remaining life)\n  Notice: No guaranteed overwrite deletion for SSD architecture.",
		"sys.verify_system_integrity": "Integrity validation scan:\n  etc/hosts: INVALID\n  spooler.dll: OK\n  UAC active: OK",
	}

	// SEC-003: Use exact match, not prefix, to prevent command ambiguity.
	if output, isAllowed := allowedCommands[trimmedCmd]; isAllowed {
		// TODO: Replace this simulated output with real calls to Windows APIs (e.g., using golang.org/x/sys/windows/registry).
		return output, nil
	}

	// This is a security violation. It must be logged to a secure audit trail.
	return "", fmt.Errorf("[SECURITY BLOCK] Comando no autorizado o desconocido: '%s'", trimmedCmd)
}
