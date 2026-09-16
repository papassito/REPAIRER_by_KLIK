package main

import (
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"repairer/internal/compensation"
	"repairer/internal/contracts"
	"repairer/internal/crypto"
	"repairer/internal/engine"
	"repairer/internal/operations"
	"time"
)

// main is the entry point that demonstrates the core engine flow.
func main() {
	fmt.Println("[*] REPAIRER by KLIK - Safe Windows Core Engine Initialized.")

	// Setup temporary mock targets for the simulation.
	tempDir, err := os.MkdirTemp("", "repairer_test")
	if err != nil {
		panic(fmt.Sprintf("failed to create temp dir: %v", err))
	}
	defer os.RemoveAll(tempDir)

	targetFile := filepath.Join(tempDir, "hosts")
	backupFile := filepath.Join(tempDir, "hosts.bak")
	ledgerFile := filepath.Join(tempDir, "repairer.ledger.jsonl")

	originalContent := "127.0.0.1 localhost\n127.0.0.1 infected-domain.com\n"
	if err := os.WriteFile(targetFile, []byte(originalContent), 0644); err != nil {
		panic(fmt.Sprintf("failed to write mock file: %v", err))
	}
	fmt.Printf("[*] Target system file initialized at: %s\n", targetFile)

	configDir, err := os.UserConfigDir()
	if err != nil {
		panic(fmt.Sprintf("could not get user config directory: %v", err))
	}
	repairerConfigDir := filepath.Join(configDir, "repairer")
	os.MkdirAll(repairerConfigDir, 0700)

	keyFile := filepath.Join(repairerConfigDir, "engine.key")
	publicKey, privateKey, err := crypto.LoadOrGenerateKeys(keyFile)
	if err != nil {
		panic(fmt.Sprintf("failed to load or generate signature keys: %v", err))
	}
	fmt.Printf("[*] Engine identity loaded. Public Key: %s\n", hex.EncodeToString(publicKey))

	registry := operations.NewRegistry()
	registry.Register("file.observe", &operations.FileObserveHandler{})
	registry.Register("file.clean", &operations.FileCleanHandler{})

	plan := contracts.Plan{
		PlanID:    "plan-019a-win-hosts-observe-clean",
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
		Operations: []contracts.OperationInstance{
			{
				InstanceID:       "op-001-observe",
				OperationID:      "file.observe",
				OperationVersion: "1",
				RiskClass:        contracts.RiskReadOnly,
				TargetRef:        targetFile,
			},
			{
				InstanceID:       "op-002-clean",
				OperationID:      "file.clean",
				OperationVersion: "1",
				RiskClass:        contracts.RiskReversible,
				TargetRef:        targetFile,
				Parameters: map[string]string{
					"backup_ref": backupFile,
				},
			},
		},
	}

	completedRecords, err := engine.ExecutePlan(plan, ledgerFile, tempDir, registry, privateKey, publicKey)
	if err != nil {
		fmt.Printf("\n[!!!] A critical error occurred during plan execution: %v\n", err)
		os.Exit(1)
	}

	// --- Rollback Simulation ---
	var recordToRollback *contracts.LedgerRecord
	for i := len(completedRecords) - 1; i >= 0; i-- {
		if completedRecords[i].Operation.RiskClass == contracts.RiskReversible {
			rec := completedRecords[i]
			recordToRollback = &rec
			break
		}
	}

	if recordToRollback != nil {
		fmt.Println("\n[*] Simulating Go rollback engine from declarative ledger record...")
		if err := compensation.Compensate(*recordToRollback, tempDir); err != nil {
			fmt.Printf("[!] Rollback failed: %v\n", err)
			os.Exit(1)
		}
		fmt.Println(" [+] Rollback execution complete and successful.")
	}

	// --- Final Verification ---
	// (This part remains for demo purposes)
}
