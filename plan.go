package contracts

import (
	"errors"
	"time"
)

// Plan represents a set of operations to be executed.
type Plan struct {
	PlanID        string              `json:"plan_id"`
	CreatedAt     string              `json:"created_at"`
	ExpiresAt     time.Time           `json:"expires_at,omitempty"`
	ApprovedBy    string              `json:"approved_by,omitempty"`
	PlanSignature string              `json:"plan_signature,omitempty"`
	Operations    []OperationInstance `json:"operations"`
}

// Validate checks the basic integrity of a plan.
func (p *Plan) Validate() error {
	if p.PlanID == "" {
		return errors.New("plan is missing a PlanID")
	}
	if len(p.Operations) == 0 {
		return errors.New("plan has no operations")
	}
	return nil
}

// OperationInstance represents a specific invocation of an operation within a plan.
type OperationInstance struct {
	InstanceID       string            `json:"instance_id"`
	OperationID      string            `json:"operation_id"`
	OperationVersion string            `json:"operation_version"`
	RiskClass        RiskClass         `json:"risk_class"`
	TargetRef        string            `json:"target_ref"`
	Parameters       map[string]string `json:"parameters,omitempty"`
}
