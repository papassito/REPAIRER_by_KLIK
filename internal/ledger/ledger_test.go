package ledger

import (
	"fmt"
	"sync"
	"testing"
)

// TestLedgerConcurrency comprueba que múltiples lecturas y escrituras no causen errores de memoria.
func TestLedgerConcurrency(t *testing.T) {
	l := NewLedger()
	var wg sync.WaitGroup

	numGoroutines := 100

	// Simula 100 escrituras concurrentes
	for i := 0; i < numGoroutines; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			data := []byte(fmt.Sprintf("Datos de transaccion %d", id))
			_, err := l.AppendRecord(fmt.Sprintf("ID-%d", id), data)
			if err != nil {
				t.Errorf("Error al insertar registro: %v", err)
			}
		}(i)
	}

	// Simula 10 lecturas concurrentes simultáneas
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			_ = l.VerifyChain()
		}()
	}

	wg.Wait()

	if err := l.VerifyChain(); err != nil {
		t.Fatalf("La cadena se corrompió bajo carga concurrente: %v", err)
	}
}