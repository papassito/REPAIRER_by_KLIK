package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"repairer/core"
	"time"
)

// runMaintenancePlan is the core engine that processes a plan, executes operations,
// records them in a ledger, and handles compensation.
func runMaintenancePlan(plan core.Plan, ledgerPath string) ([]core.LedgerRecord, error) {
	fmt.Printf("[*] Executing Plan '%s'...\n", plan.PlanID)

	if err := plan.Validate(); err != nil {
		return nil, fmt.Errorf("plan validation failed: %w", err)
	}
	fmt.Println(" [+] Plan structure is valid.")

	var lastRecordHash string
	var completedRecords []core.LedgerRecord

	for _, op := range plan.Operations {
		fmt.Printf("\n[*] Running Operation: '%s' (%s)\n", op.InstanceID, op.OperationID)

		var record *core.LedgerRecord
		var err error

		// This switch acts as a dispatcher to the corresponding operation implementation.
		// In a real application, this might be a map of functions from an operation catalog.
		switch op.OperationID {
		case "file.clean":
			record, err = executeFileClean(op)
		case "file.observe":
			record, err = executeFileObserve(op)
		default:
			err = fmt.Errorf("unknown operation ID: %s", op.OperationID)
		}

		if err != nil {
			// A failure during execution should still be recorded in the ledger.
			// For this example, we'll return the error to halt the entire plan.
			return completedRecords, fmt.Errorf("operation '%s' failed during execution: %w", op.InstanceID, err)
		}

		// Finalize and write the ledger record.
		record.SchemaVersion = core.LedgerSchemaVersion
		record.RecordID = fmt.Sprintf("rec-%s-%d", op.InstanceID, time.Now().Unix())
		record.Sequence = len(completedRecords) + 1
		record.RecordedAt = time.Now().UTC().Format(time.RFC3339)
		record.PreviousRecordHash = lastRecordHash

		if err := record.Validate(); err != nil {
			return completedRecords, fmt.Errorf("generated ledger record for op '%s' is invalid: %w", op.InstanceID, err)
		}

		// Hash the record and append it to the ledger file.
		hash, err := core.HashLedgerRecord(*record)
		if err != nil {
			return completedRecords, fmt.Errorf("could not hash ledger record: %w", err)
		}
		record.RecordHash = hash

		if err := core.AppendLedger(ledgerPath, *record); err != nil {
			return completedRecords, fmt.Errorf("failed to write ledger record for op '%s': %w", op.InstanceID, err)
		}

		recordJSON, _ := json.MarshalIndent(record, "", "  ")
		fmt.Printf("[*] Declarative Ledger Record Written:\n%s\n", string(recordJSON))

		lastRecordHash = record.RecordHash
		completedRecords = append(completedRecords, *record)
	}

	fmt.Printf("\n[*] Plan '%s' execution finished.\n", plan.PlanID)
	return completedRecords, nil
}

// executeFileClean implements a REVERSIBLE operation to clean a file's content.
func executeFileClean(op core.OperationInstance) (*core.LedgerRecord, error) {
	if op.RiskClass != core.RiskReversible {
		return nil, errors.New("file.clean must be a REVERSIBLE operation")
	}
	targetFile := op.TargetRef
	backupFile, ok := op.Parameters["backup_ref"]
	if !ok || backupFile == "" {
		return nil, errors.New("missing 'backup_ref' parameter for file.clean")
	}
	// SECURITY: The targetFile path MUST be normalized and validated against the authorized
	// scope of the plan. This prototype does not include path validation, which is a
	// critical defense against path traversal attacks (e.g., "../../../boot.ini").
	// This operation should be disabled for real resources until security controls are implemented.
	// A real implementation would look like this, per SEC-002:
	//
	// authorizedScope := getScopeForPlan(plan) // e.g., "C:\Users\TestUser\AppData"
	// if err := core.ValidatePath(targetFile, authorizedScope); err != nil {
	//     return nil, fmt.Errorf("path validation failed for target: %w", err)
	// }
	// if err := core.ValidatePath(backupFile, authorizedScope); err != nil {
	//     return nil, fmt.Errorf("path validation failed for backup: %w", err)
	// }

	// 1. Prepare Compensation / Backup (FR-004)
	fmt.Println("[*] Preparing compensation state (backing up file)...")
	backup, err := core.PrepareBackup(targetFile, backupFile)
	if err != nil {
		// Per FR-004, if backup fails, the operation must not proceed.
		return nil, fmt.Errorf("failed to prepare backup, aborting operation: %w", err)
	}
	fmt.Printf(" [+] Safe Backup verified. Hash: %s\n", backup.SHA256)

	// 2. Perform safe Go-only mutation
	fmt.Println("[*] Executing safe file modification via Go APIs...")
	cleanedContent := "127.0.0.1 localhost\n" // The "clean" state
	err = os.WriteFile(targetFile, []byte(cleanedContent), 0644)
	if err != nil {
		// In a real engine, we might try to auto-compensate here. For now, we fail hard.
		return nil, fmt.Errorf("failed to write cleaned file: %w", err)
	}

	hasher := sha256.New()
	hasher.Write([]byte(cleanedContent))
	currentHash := hex.EncodeToString(hasher.Sum(nil))
	fmt.Printf(" [+] System file updated safely. Current State Hash: %s\n", currentHash)

	// 3. Create Declarative Ledger Entry
	record := &core.LedgerRecord{
		EventType: "OPERATION_COMPLETED",
		Operation: op,
		Outcome: core.OperationOutcome{
			Status:  "SUCCEEDED_VERIFIED",
			Changed: true,
		},
		Compensation: core.CompensationDescriptor{
			DescriptorType:    core.CompensationType,
			DescriptorVersion: "1",
			BackupRef:         backup.Path,
			TargetRef:         targetFile,
			BackupHash:        backup.SHA256, // CRITICAL: Include the hash for verifiable compensation.
		},
	}

	return record, nil
}

// executeFileObserve implements a READ_ONLY operation to observe a file's state.
func executeFileObserve(op core.OperationInstance) (*core.LedgerRecord, error) {
	if op.RiskClass != core.RiskReadOnly {
		return nil, errors.New("file.observe must be a READ_ONLY operation")
	}
	targetFile := op.TargetRef
	if targetFile == "" {
		return nil, errors.New("missing 'target_ref' for file.observe")
	}

	fmt.Printf("[*] Observing file: %s\n", targetFile)

	data, err := os.ReadFile(targetFile)
	if err != nil {
		// Even if the file can't be read, we record the attempt and its failure.
		return &core.LedgerRecord{
			EventType: "OPERATION_COMPLETED",
			Operation: op,
			Outcome: core.OperationOutcome{
				Status:  "FAILED_NO_CHANGE",
				Changed: false,
			},
		}, nil
	}

	hash := sha256.Sum256(data)
	fileHash := hex.EncodeToString(hash[:])
	fmt.Printf(" [+] File observed. Hash: %s\n", fileHash)

	// Record the successful observation.
	return &core.LedgerRecord{
		EventType: "OPERATION_COMPLETED",
		Operation: op,
		Outcome: core.OperationOutcome{
			Status:  "SUCCEEDED_VERIFIED",
			Changed: false, // READ_ONLY operations do not change state.
		},
		// No Compensation descriptor for READ_ONLY operations.
	}, nil
}

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

	// Populate mock target state.
	originalContent := "127.0.0.1 localhost\n127.0.0.1 infected-domain.com\n"
	if err := os.WriteFile(targetFile, []byte(originalContent), 0644); err != nil {
		panic(fmt.Sprintf("failed to write mock file: %v", err))
	}
	fmt.Printf("[*] Target system file initialized at: %s\n", targetFile)

	// Create a maintenance plan with both READ_ONLY and REVERSIBLE operations.
	plan := core.Plan{
		PlanID:    "plan-019a-win-hosts-observe-clean",
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
		Operations: []core.OperationInstance{
			{
				InstanceID:       "op-001-observe",
				OperationID:      "file.observe",
				OperationVersion: "1",
				RiskClass:        core.RiskReadOnly,
				TargetRef:        targetFile,
			},
			{
				InstanceID:       "op-002-clean",
				OperationID:      "file.clean",
				OperationVersion: "1",
				RiskClass:        core.RiskReversible,
				TargetRef:        targetFile,
				Parameters: map[string]string{
					"backup_ref": backupFile,
				},
			},
		},
	}

	// Execute the plan and get the resulting ledger records.
	completedRecords, err := runMaintenancePlan(plan, ledgerFile)
	if err != nil {
		fmt.Printf("\n[!!!] A critical error occurred during plan execution: %v\n", err)
		os.Exit(1)
	}

	// --- Rollback Simulation ---
	// Find the last reversible operation to demonstrate compensation.
	var recordToRollback *core.LedgerRecord
	for i := len(completedRecords) - 1; i >= 0; i-- {
		if completedRecords[i].Operation.RiskClass == core.RiskReversible {
			rec := completedRecords[i]
			recordToRollback = &rec
			break
		}
	}

	if recordToRollback != nil {
		fmt.Println("\n[*] Simulating Go rollback engine from declarative ledger record...")
		err := core.Compensate(*recordToRollback)
		if err != nil {
			fmt.Printf("[!] Rollback failed: %v\n", err)
			os.Exit(1)
		}
		fmt.Println(" [+] Rollback execution complete and successful.")
	}

	// --- Final Verification ---
	fmt.Println("\n[*] Verifying final state of target file after rollback...")
	finalContent, err := os.ReadFile(targetFile)
	if err != nil {
		fmt.Printf("[!] Could not read final state: %v\n", err)
	} else {
		fmt.Printf(" [+] Final content of '%s':\n---\n%s---\n", filepath.Base(targetFile), string(finalContent))
		if string(finalContent) == originalContent {
			fmt.Println(" [+] Verification successful: File has been rolled back to its original state.")
		} else {
			fmt.Println("[!] Verification failed: File content does not match original state after rollback.")
		}
	}
}
