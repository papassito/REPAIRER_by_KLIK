# Conformance Matrix - REPAIRER by KLIK

| Requisito | Componente | Implementación | Prueba | Evidencia | Estado |
| --------- | ---------- | -------------- | ------ | --------- | ------ |
| `FR-002`  | core/ledger.go | RiskClass definitions exist in Go source. | main.go prototype uses these types. | Go source code is present. | `IMPLEMENTED_UNVERIFIED` |
| `FR-003`  | Pendiente (Planner/Executor en Go) | Segregated observation, planning and authorized execution. | Pendiente | N/A | `SPECIFIED` |
| `FR-005`  | core/compensation.go | Backup preparation logic exists in Go source. | main.go prototype simulates this flow. | Go source code is present. | `IMPLEMENTED_UNVERIFIED` |
| `FR-009`  | core/ledger.go | Declarative ledger structures exist in Go source. | main.go prototype generates these structures. | Go source code is present. | `IMPLEMENTED_UNVERIFIED` |
| `SEC-003` | Pendiente (Core Executor en Go) | Safe Windows API allowlist constraints, no system exec. | Pendiente | N/A | `SPECIFIED` |
| `DATA-001`| Pendiente (Componente de Presentación en Go) | SSD notice explicitly displayed for overwriting. | Pendiente | N/A | `SPECIFIED` |
| `NFR-006` | docs/matrix.md | Pending compatibility runs on clean environments. | N/A | No reports received. | `SPECIFIED` |
| `REL-004` | CI/CD | Pending package release certs. | N/A | No code signatures verified yet. | `SPECIFIED` |

### Status Legend:
- `VERIFIED`: Implemented with reproducible proof of correct execution in a target environment.
- `IMPLEMENTED_UNVERIFIED`: Source code is present in the repository but lacks automated tests or execution evidence in a target environment.
- `SPECIFIED`: A documented requirement or decision, pending implementation.
- `BLOCKED`: Pending other components or decisions.
- `OUT_OF_SCOPE`: Explicitly excluded from the current project baseline.