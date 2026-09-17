package engine

import (
	"crypto/ed25519"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"repairer/internal/contracts"
	"repairer/internal/crypto"
	"repairer/internal/ledger"
	"repairer/internal/operations"
	"repairer/internal/security"
	"time"
)

// ExecutePlan is the core engine that processes a plan, executes operations,
// records them in a ledger, and handles compensation.
func ExecutePlan(plan contracts.Plan, ledgerPath, authorizedScope string, registry *operations.Registry, signerKey ed25519.PrivateKey, verifierKey ed25519.PublicKey) ([]contracts.LedgerRecord, error) {
	fmt.Printf("[*] Executing Plan '%s'...\n", plan.PlanID)

	if err := plan.Validate(); err != nil {
		return nil, fmt.Errorf("plan validation failed: %w", err)
	}
	fmt.Println(" [+] Plan structure is valid.")

	lastRecordHash, err := ledger.GetLastRecordHash(ledgerPath, verifierKey)
	if err != nil {
		return nil, fmt.Errorf("could not read last ledger state: %w", err)
	}
	var completedRecords []contracts.LedgerRecord

	for _, op := range plan.Operations {
		fmt.Printf("\n[*] Running Operation: '%s' (%s)\n", op.InstanceID, op.OperationID)

		if !operations.AllowedOperations[op.OperationID] {
			return completedRecords, fmt.Errorf("operation ID '%s' is not in the allowed catalog", op.OperationID)
		}

		// Initial high-level validation.
		pathsToValidate := []string{op.TargetRef}
		if backupRef, ok := op.Parameters["backup_ref"]; ok {
			pathsToValidate = append(pathsToValidate, backupRef)
		}
		for _, p := range pathsToValidate {
			if p == "" {
				continue
			}
			if _, err := security.ValidateSafePath(authorizedScope, p); err != nil {
				return nil, fmt.Errorf("path validation failed: %w", err)
			}
		}

		handler, err := registry.Get(op.OperationID)
		if err != nil {
			return completedRecords, err
		}

		record, err := handler.Execute(op, authorizedScope)
		if err != nil {
			return completedRecords, fmt.Errorf("operation '%s' failed during execution: %w", op.InstanceID, err)
		}

		// Finalize and write the ledger record.
		record.SchemaVersion = contracts.LedgerSchemaVersion
		record.RecordID = fmt.Sprintf("rec-%s-%d", op.InstanceID, time.Now().Unix())
		record.Sequence = len(completedRecords) + 1
		record.RecordedAt = time.Now().UTC().Format(time.RFC3339)
		record.PreviousRecordHash = lastRecordHash

		if err := record.Validate(); err != nil {
			return completedRecords, fmt.Errorf("generated ledger record for op '%s' is invalid: %w", op.InstanceID, err)
		}

		hash, err := ledger.HashLedgerRecord(*record)
		if err != nil {
			return completedRecords, fmt.Errorf("could not hash ledger record: %w", err)
		}
		record.RecordHash = hash

		signature, err := crypto.SignRecord(record.RecordHash, signerKey)
		if err != nil {
			return completedRecords, fmt.Errorf("could not sign ledger record: %w", err)
		}
		record.Signature.SignerID = hex.EncodeToString(verifierKey)
		record.Signature.Signature = signature

		if err := ledger.AppendRecord(ledgerPath, *record); err != nil {
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
