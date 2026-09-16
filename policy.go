package engine

import (
	"fmt"
	"repairer/internal/contracts"
)

// ExecutionPolicy defines the rules for an execution run.
type ExecutionPolicy struct {
	AllowDestructive  bool
	AllowIrreversible bool
}

func (p *ExecutionPolicy) IsAllowed(op contracts.OperationInstance) error {
	if op.RiskClass == contracts.RiskDestructive && !p.AllowDestructive {
		return fmt.Errorf("operation %s is DESTRUCTIVE and is not allowed by the current policy", op.InstanceID)
	}
	if op.RiskClass == contracts.RiskIrreversible && !p.AllowIrreversible {
		return fmt.Errorf("operation %s is IRREVERSIBLE and is not allowed by the current policy", op.InstanceID)
	}
	return nil
}
