# Conformance Matrix - REPAIRER by KLIK

| Requisito | Componente | Implementación | Prueba | Evidencia | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `FR-PROV-001` | internal/contracts | `Observation` struct (propuesto) | Pendiente | N/A | `SPECIFIED` |
| `FR-PROV-002` | internal/contracts | `acquisition_status` (propuesto) | Pendiente | N/A | `SPECIFIED` |
| `FR-CORE-001` | internal/operations | `OperationID` en `OperationInstance` | Pendiente | N/A | `SPECIFIED` |
| `FR-CORE-002` | internal/contracts | `RiskClass` en `OperationInstance` | `main.go` (demo) | Código fuente | `IMPLEMENTED_UNVERIFIED` |
| `FR-CORE-003` | internal/engine | Separación `ExecutePlan` de `Plan` | `main.go` (demo) | Código fuente | `IMPLEMENTED_UNVERIFIED` |
| `FR-CORE-005` | internal/compensation | `PrepareBackup` | Pendiente | N/A | `IMPLEMENTED_UNVERIFIED` |
| `FR-CORE-009` | internal/contracts | `LedgerRecord` struct | `main.go` (demo) | Código fuente | `IMPLEMENTED_UNVERIFIED` |
| `FR-VFY-001` | internal/contracts | `OperationOutcome` status | Pendiente | N/A | `SPECIFIED` |
| `FR-INV-001` | Pendiente (platform/windows) | Pendiente | Pendiente | N/A | `SPECIFIED` |
| `FR-STO-001` | Pendiente (platform/windows) | Pendiente | Pendiente | N/A | `SPECIFIED` |
| `FR-HLT-001` | Pendiente (platform/windows) | Pendiente | Pendiente | N/A | `SPECIFIED` |
| `FR-NET-001` | Pendiente (platform/windows) | Pendiente | Pendiente | N/A | `SPECIFIED` |
| `FR-FND-001` | Pendiente (engine/findings) | Pendiente | Pendiente | N/A | `SPECIFIED` |
| `SEC-002` | internal/security | `ValidatePath` | Pendiente | Código fuente | `IMPLEMENTED_UNVERIFIED` |
| `SEC-003` | internal/engine | `OperationRegistry` | `main.go` (demo) | Código fuente | `IMPLEMENTED_UNVERIFIED` |
| `TECH-001` | (Todo el proyecto) | Código base es Go | `go.mod` | `go.mod` | `VERIFIED` |

---

### Matriz Original (Histórica)
| Requisito | Componente | Implementación | Prueba | Evidencia | Estado |
| --------- | ---------- | -------------- | ------ | --------- | ------ |
| `FR-002`  | core/ledger.go | RiskClass definitions exist in Go source. | main.go prototype uses these types. | Go source code is present. | `IMPLEMENTED_UNVERIFIED` |

### Status Legend:
- `VERIFIED`: Implemented with reproducible proof of correct execution in a target environment.
- `IMPLEMENTED_UNVERIFIED`: Source code is present in the repository but lacks automated tests or execution evidence in a target environment.
- `SPECIFIED`: A documented requirement or decision, pending implementation.
- `BLOCKED`: Pending other components or decisions.
- `OUT_OF_SCOPE`: Explicitly excluded from the current project baseline.