# Registro de Evidencia

Este archivo registrará la evidencia reproducible de compilación, pruebas y otros procesos de verificación del proyecto.

---

## E-001: Verificación de Compilación Post-Recuperación (`BUILD_RECOVERED`)

- **Fecha de ejecución:** 2026-09-15
- **Revisión del código:** No registrada.
- **Versión de Go:** `go version go1.21.5 windows/amd64`
- **Sistema y arquitectura:** `windows/amd64`

### 1. Inventario y Hashes de Archivos

- `main.go` (10103 bytes): `33d91ffca4b28c89400820c1abda398a4a7cd9ec78de3d799256476dfd23f999`
- `go.mod` (25 bytes): `c6154aa5c524dc56cb97078b01acddd8bc02ec72cbb7f10fb9f77cc80ca34b63`
- `core\app.go` (2172 bytes): `21c328df3c9980f19a6cae70f5f392d4071dd93bbdd549f832d0ba52a0fd04c3`
- `core\compensation.go` (4403 bytes): `22984919b12f23bcefe80b9fe2bf7457c18d1ec45b7a863fa2d11e1f7b015ab5`
- `core\ledger.go` (6443 bytes): `29ef2247ec36264c9191a54377b0d2d9c8639dbf03ef9ba6a25723729ac8af3d`

### 2. Ejecución de Comandos de Verificación

#### `go list ./...`

**Salida literal:**
```text
repairer
repairer/core
```
**Código de salida:** 0
**Conclusión:** Las herramientas de Go reconocen ambos paquetes del proyecto.

---

#### 2. `gofmt -l .`

**Salida:**
```text
core\app.go
core\compensation.go
core\ledger.go
main.go
```
**Código de salida:** 0
**Conclusión:** Se identifican 4 archivos Go que requieren formato.

---

#### 3. `go build ./...`

**Salida:** (vacía)
**Código de salida:** 0
**Conclusión:** Todos los paquetes del proyecto compilan exitosamente.

---

#### 4. `go vet ./...`

**Salida:** (vacía)
**Código de salida:** 0
**Conclusión:** El analizador estático no encuentra problemas en el código.

---

#### 5. `go test -count=1 ./...`

**Salida:**
```text
?       repairer        [no test files]
?       repairer/core   [no test files]
```
**Código de salida:** 0
**Conclusión:** El comando se ejecuta correctamente y confirma la ausencia de archivos de prueba en ambos paquetes.