package contracts

import "errors"

// LedgerSchemaVersion defines the current version of the ledger record structure.
// This MUST be incremented when any backward-incompatible change is made.
const LedgerSchemaVersion = "1.1" // Incremented from 1.0 due to addition of Signature

// LedgerSignature holds the cryptographic signature of a ledger record.
type LedgerSignature struct {
	SignerID  string `json:"signer_id"`
	Signature string `json:"signature"`
}

// OperationOutcome describes the result of an operation.
type OperationOutcome struct {
	Status  string `json:"status"`
	Changed bool   `json:"changed"`
}

// LedgerRecord represents a single, immutable entry in the audit ledger.
type LedgerRecord struct {
	SchemaVersion      string                 `json:"schema_version"`
	RecordID           string                 `json:"record_id"`
	Sequence           int                    `json:"sequence"`
	RecordedAt         string                 `json:"recorded_at"`
	EventType          string                 `json:"event_type"`
	Operation          OperationInstance      `json:"operation"`
	Outcome            OperationOutcome       `json:"outcome"`
	Compensation       CompensationDescriptor `json:"compensation,omitempty"`
	PreviousRecordHash string                 `json:"previous_record_hash"`
	RecordHash         string                 `json:"record_hash"`
	Signature          LedgerSignature        `json:"signature"`
}

// Validate checks the basic integrity of a ledger record before it's hashed.
func (r *LedgerRecord) Validate() error {
	if r.RecordID == "" {
		return errors.New("record is missing a RecordID")
	}
	if r.Operation.InstanceID == "" {
		return errors.New("record is missing an operation instance ID")
	}
	return nil
}
