package ledger

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"sync"
)

// Record representa un registro individual e inmutable dentro de la cadena.
type Record struct {
	ID          string `json:"id"`
	Data        []byte `json:"data"`
	PrevHash    string `json:"prev_hash"`
	CurrentHash string `json:"current_hash"`
}

// Ledger administra la lista de registros con protección de concurrencia.
type Ledger struct {
	mu      sync.RWMutex // Cerrojo RWMutex para evitar condiciones de carrera.
	records []Record
}

var (
	ErrEmptyData      = errors.New("error: no se pueden ingresar registros sin datos")
	ErrCorruptedChain = errors.New("error: la integridad de la cadena ha sido comprometida")
)

// NewLedger inicializa una nueva instancia del libro mayor.
func NewLedger() *Ledger {
	return &Ledger{
		records: make([]Record, 0),
	}
}

// AppendRecord agrega un registro de forma totalmente segura entre múltiples hilos.
func (l *Ledger) AppendRecord(id string, data []byte) (Record, error) {
	if len(data) == 0 {
		return Record{}, ErrEmptyData
	}

	// Bloqueo de escritura exclusivo
	l.mu.Lock()
	defer l.mu.Unlock()

	var prevHash string
	if len(l.records) > 0 {
		prevHash = l.records[len(l.records)-1].CurrentHash
	} else {
		prevHash = "0000000000000000000000000000000000000000000000000000000000000000"
	}

	h := sha256.New()
	h.Write([]byte(prevHash))
	h.Write(data)
	currentHash := hex.EncodeToString(h.Sum(nil))

	newRecord := Record{
		ID:          id,
		Data:        data,
		PrevHash:    prevHash,
		CurrentHash: currentHash,
	}

	l.records = append(l.records, newRecord)
	return newRecord, nil
}

// VerifyChain audita la integridad de la cadena permitiendo lecturas concurrentes.
func (l *Ledger) VerifyChain() error {
	// Bloqueo de lectura compartido
	l.mu.RLock()
	defer l.mu.RUnlock()

	for i := 0; i < len(l.records); i++ {
		expectedPrev := "0000000000000000000000000000000000000000000000000000000000000000"
		if i > 0 {
			expectedPrev = l.records[i-1].CurrentHash
		}

		if l.records[i].PrevHash != expectedPrev {
			return ErrCorruptedChain
		}
	}
	return nil
}