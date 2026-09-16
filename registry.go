package operations

import (
	"fmt"
	"repairer/internal/contracts"
)

// Handler defines the interface that all executable operations must implement.
type Handler interface {
	Execute(op contracts.OperationInstance, authorizedScope string) (*contracts.LedgerRecord, error)
}

// Registry holds the mapping from an operation ID to its handler.
type Registry struct {
	handlers map[string]Handler
}

func NewRegistry() *Registry {
	return &Registry{handlers: make(map[string]Handler)}
}

func (r *Registry) Register(id string, handler Handler) {
	r.handlers[id] = handler
}

func (r *Registry) Get(id string) (Handler, error) {
	handler, ok := r.handlers[id]
	if !ok {
		return nil, fmt.Errorf("unknown operation ID: %s", id)
	}
	return handler, nil
}
