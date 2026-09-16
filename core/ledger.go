package core

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type RiskClass string

const (
	RiskReadOnly     RiskClass = "READ_ONLY"
	RiskReversible   RiskClass = "REVERSIBLE"
	RiskDestructive  RiskClass = "DESTRUCTIVE"
	RiskIrreversible RiskClass = "IRREVERSIBLE"
)

type OperationInstance struct {
	InstanceID       string            `json:"instance_id"`
	OperationID      string            `json:"operation_id"`
	OperationVersion string            `json:"operation_version"`
	RiskClass        RiskClass         `json:"risk_class"`
	TargetRef        string            `json:"target_ref"`
	Parameters       map[string]string `json:"parameters,omitempty"`
}

type Plan struct {
	PlanID     string              `json:"plan_id"`
	CreatedAt  string              `json:"created_at"`
	Operations []OperationInstance `json:"operations"`
}

type CompensationDescriptor struct {
	DescriptorType    string `json:"descriptor_type"`
	DescriptorVersion string `json:"descriptor_version"`
	BackupRef         string `json:"backup_ref"`
	TargetRef         string `json:"target_ref"`
	BackupHash        string `json:"backup_hash"`
}

type OperationOutcome struct {
	Status  string `json:"status"`
	Changed bool   `json:"changed"`
}

type LedgerRecord struct {
	SchemaVersion      string                 `json:"schema_version"`
	RecordID           string                 `json:"record_id"`
	Sequence           int                    `json:"sequence"`
	RecordedAt         string                 `json:"recorded_at"`
	SessionID          string                 `json:"session_id,omitempty"`
	ExecutionID        string                 `json:"execution_id,omitempty"`
	EventType          string                 `json:"event_type"`
	Operation          OperationInstance      `json:"operation"`
	Outcome            OperationOutcome       `json:"outcome"`
	Compensation       CompensationDescriptor `json:"compensation"`
	PreviousRecordHash string                 `json:"previous_record_hash,omitempty"`
	RecordHash         string                 `json:"record_hash"`
}

const (
	LedgerSchemaVersion = "1.0"
	CompensationType    = "RESTORE_PREVIOUS_VERSION"
)

func ValidateRiskClass(class RiskClass) error {
	switch class {
	case RiskReadOnly, RiskReversible, RiskDestructive, RiskIrreversible:
		return nil
	default:
		return fmt.Errorf("unknown risk class %q", class)
	}
}

func (plan Plan) Validate() error {
	if strings.TrimSpace(plan.PlanID) == "" || len(plan.Operations) == 0 {
		return errors.New("plan requires an id and at least one operation")
	}
	seen := make(map[string]struct{}, len(plan.Operations))
	for _, operation := range plan.Operations {
		if strings.TrimSpace(operation.InstanceID) == "" || strings.TrimSpace(operation.OperationID) == "" {
			return errors.New("operation requires instance_id and operation_id")
		}
		if _, ok := seen[operation.InstanceID]; ok {
			return fmt.Errorf("duplicate operation instance %q", operation.InstanceID)
		}
		seen[operation.InstanceID] = struct{}{}
		if err := ValidateRiskClass(operation.RiskClass); err != nil {
			return err
		}
		if operation.RiskClass != RiskReadOnly && strings.TrimSpace(operation.TargetRef) == "" {
			return fmt.Errorf("mutating operation %q requires an explicit target", operation.InstanceID)
		}
	}
	return nil
}

func PlanDigest(plan Plan) (string, error) {
	if err := plan.Validate(); err != nil {
		return "", err
	}
	data, err := json.Marshal(plan)
	if err != nil {
		return "", fmt.Errorf("marshal plan: %w", err)
	}
	hash := sha256.Sum256(data)
	return "sha256:" + hex.EncodeToString(hash[:]), nil
}

func (record LedgerRecord) Validate() error {
	if record.SchemaVersion != LedgerSchemaVersion || strings.TrimSpace(record.RecordID) == "" || record.Sequence < 1 {
		return errors.New("invalid ledger schema, record id, or sequence")
	}
	if _, err := time.Parse(time.RFC3339, record.RecordedAt); err != nil {
		return fmt.Errorf("recorded_at must be RFC3339 UTC: %w", err)
	}
	if record.EventType == "" || record.Outcome.Status == "" {
		return errors.New("ledger event and outcome status are required")
	}
	if err := ValidateRiskClass(record.Operation.RiskClass); err != nil {
		return err
	}
	if record.Compensation.DescriptorType != "" && record.Compensation.DescriptorType != CompensationType {
		return fmt.Errorf("unknown compensation descriptor type %q", record.Compensation.DescriptorType)
	}
	if strings.Contains(strings.ToLower(record.Compensation.BackupRef), "command") {
		return errors.New("executable compensation references are not allowed")
	}
	return nil
}

func HashLedgerRecord(record LedgerRecord) (string, error) {
	record.RecordHash = ""
	data, err := json.Marshal(record)
	if err != nil {
		return "", fmt.Errorf("marshal ledger record: %w", err)
	}
	hash := sha256.Sum256(data)
	return "sha256:" + hex.EncodeToString(hash[:]), nil
}

func AppendLedger(path string, record LedgerRecord) error {
	if err := record.Validate(); err != nil {
		return err
	}
	computed, err := HashLedgerRecord(record)
	if err != nil {
		return err
	}
	if record.RecordHash != "" && record.RecordHash != computed {
		return errors.New("ledger record hash mismatch")
	}
	record.RecordHash = computed
	data, err := json.Marshal(record)
	if err != nil {
		return fmt.Errorf("marshal ledger: %w", err)
	}
	if err := os.MkdirAll(filepath.Dir(path), 0700); err != nil {
		return fmt.Errorf("create ledger directory: %w", err)
	}
	file, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0600)
	if err != nil {
		return fmt.Errorf("open ledger: %w", err)
	}
	defer file.Close()
	if _, err := file.Write(append(data, '\n')); err != nil {
		return fmt.Errorf("write ledger: %w", err)
	}
	return nil
}

// GetLastRecordHash is a placeholder function. A real implementation would read
// the last line of the ledger file, parse it, verify its hash, and return it.
// It returns an empty string if the ledger does not exist, starting a new chain.
func GetLastRecordHash(path string) (string, error) {
	// This is a placeholder. A real implementation is required as per WP-005.
	// For this prototype, we always start a new chain.
	// A real implementation would also need to handle file locking.
	return "", nil
}
