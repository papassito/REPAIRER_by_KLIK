package contracts

// RiskClass defines the type of risk associated with an operation.
type RiskClass string

const (
	RiskReadOnly     RiskClass = "READ_ONLY"
	RiskReversible   RiskClass = "REVERSIBLE"
	RiskDestructive  RiskClass = "DESTRUCTIVE"
	RiskIrreversible RiskClass = "IRREVERSIBLE"
)
