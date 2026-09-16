package engine_test

import (
	"crypto/ed25519"
	"os"
	"path/filepath"
	"repairer/internal/contracts"
	"repairer/internal/crypto"
	"repairer/internal/engine"
	"repairer/internal/operations"
	"testing"
)

// Mock successful handler
type mockSuccessHandler struct{}

func (m *mockSuccessHandler) Execute(op contracts.OperationInstance, authorizedScope string) (*contracts.LedgerRecord, error) {
	return &contracts.LedgerRecord{
		EventType: "OPERATION_COMPLETED",
		Operation: op,
		Outcome:   contracts.OperationOutcome{Status: "SUCCEEDED_VERIFIED", Changed: true},
	}, nil
}

// Mock failing handler
type mockFailHandler struct{}

func (m *mockFailHandler) Execute(op contracts.OperationInstance, authorizedScope string) (*contracts.LedgerRecord, error) {
	return &contracts.LedgerRecord{
		EventType: "OPERATION_COMPLETED",
		Operation: op,
		Outcome:   contracts.OperationOutcome{Status: "FAILED_NO_CHANGE", Changed: false},
	}, nil
}

func setupTest(t *testing.T) (string, string, *operations.Registry, ed25519.PrivateKey, ed25519.PublicKey) {
	scope := t.TempDir()
	ledgerPath := filepath.Join(scope, "test.ledger")

	pub, priv, err := crypto.LoadOrGenerateKeys(filepath.Join(scope, "test.key"))
	if err != nil {
		t.Fatalf("setup failed: could not generate keys: %v", err)
	}

	reg := operations.NewRegistry()
	reg.Register("test.success", &mockSuccessHandler{})
	reg.Register("test.fail", &mockFailHandler{})

	return scope, ledgerPath, reg, priv, pub
}

func TestExecutePlan_Success(t *testing.T) {
	scope, ledgerPath, reg, priv, pub := setupTest(t)

	plan := contracts.Plan{
		PlanID: "test-plan-success",
		Operations: []contracts.OperationInstance{
			{InstanceID: "op-1", OperationID: "test.success"},
		},
	}

	records, err := engine.ExecutePlan(plan, ledgerPath, scope, reg, priv, pub, false)
	if err != nil {
		t.Fatalf("ExecutePlan failed unexpectedly: %v", err)
	}

	if len(records) != 1 {
		t.Fatalf("Expected 1 record, got %d", len(records))
	}

	if records[0].Outcome.Status != "SUCCEEDED_VERIFIED" {
		t.Errorf("Expected status SUCCEEDED_VERIFIED, got %s", records[0].Outcome.Status)
	}

	if records[0].RecordHash == "" {
		t.Error("RecordHash was not set")
	}
	if records[0].Signature.Signature == "" {
		t.Error("Signature was not set")
	}
}

func TestExecutePlan_DryRun(t *testing.T) {
	scope, ledgerPath, reg, priv, pub := setupTest(t)

	plan := contracts.Plan{
		PlanID: "test-plan-dryrun",
		Operations: []contracts.OperationInstance{
			{InstanceID: "op-1", OperationID: "test.success"},
		},
	}

	records, err := engine.ExecutePlan(plan, ledgerPath, scope, reg, priv, pub, true)
	if err != nil {
		t.Fatalf("ExecutePlan with dry-run failed unexpectedly: %v", err)
	}

	if len(records) != 0 {
		t.Errorf("Expected 0 records in dry-run mode, got %d", len(records))
	}

	// Check that ledger file was not created
	if _, err := os.Stat(ledgerPath); !os.IsNotExist(err) {
		t.Error("Ledger file was created during dry-run")
	}
}

func TestExecutePlan_OperationFailure(t *testing.T) {
	scope, ledgerPath, reg, priv, pub := setupTest(t)

	plan := contracts.Plan{
		PlanID: "test-plan-fail",
		Operations: []contracts.OperationInstance{
			{InstanceID: "op-1", OperationID: "test.fail"},
		},
	}

	records, err := engine.ExecutePlan(plan, ledgerPath, scope, reg, priv, pub, false)
	if err != nil {
		t.Fatalf("ExecutePlan failed unexpectedly: %v", err)
	}

	if len(records) != 1 {
		t.Fatalf("Expected 1 record for a failed operation, got %d", len(records))
	}

	if records[0].Outcome.Status != "FAILED_NO_CHANGE" {
		t.Errorf("Expected status FAILED_NO_CHANGE, got %s", records[0].Outcome.Status)
	}
}

func TestExecutePlan_UnknownOperation(t *testing.T) {
	scope, ledgerPath, reg, priv, pub := setupTest(t)

	plan := contracts.Plan{
		PlanID: "test-plan-unknown",
		Operations: []contracts.OperationInstance{
			{InstanceID: "op-1", OperationID: "test.unknown"},
		},
	}

	_, err := engine.ExecutePlan(plan, ledgerPath, scope, reg, priv, pub, false)
	if err == nil {
		t.Fatal("ExecutePlan should have failed for an unknown operation, but it did not")
	}
}

func TestPolicy_IsAllowed(t *testing.T) {
	policy := engine.ExecutionPolicy{
		AllowDestructive:  false,
		AllowIrreversible: false,
	}

	opReversible := contracts.OperationInstance{InstanceID: "op-rev", RiskClass: contracts.RiskReversible}
	opDestructive := contracts.OperationInstance{InstanceID: "op-dest", RiskClass: contracts.RiskDestructive}

	if err := policy.IsAllowed(opReversible); err != nil {
		t.Errorf("Policy incorrectly blocked a REVERSIBLE operation: %v", err)
	}

	if err := policy.IsAllowed(opDestructive); err == nil {
		t.Error("Policy incorrectly allowed a DESTRUCTIVE operation")
	}

	// Change policy
	policy.AllowDestructive = true
	if err := policy.IsAllowed(opDestructive); err != nil {
		t.Errorf("Policy incorrectly blocked a DESTRUCTIVE operation after being enabled: %v", err)
	}
}
