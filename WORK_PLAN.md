# WORK PLAN - REPAIRER by KLIK

Este plan de trabajo está actualizado para reflejar la necesidad de sanear el prototipo actual y construir sobre una base Go-only limpia.

---

### Fase 1: Saneamiento y Fundación

- **ID:** WP-001 - **Saneamiento del Repositorio**
  - **Objetivo:** Eliminar todos los artefactos no conformes de la aplicación web TypeScript para cumplir con `TECH-001`.
  - **Criterio de finalización:**
    - 1. Se ha realizado una copia de seguridad del frontend web (`src/`, etc.) fuera del proyecto, si se desea conservar.
    - 2. Se ha revisado `.env.local` en busca de secretos y se han rotado si es necesario. El archivo no se ha publicado.
    - 3. Se han eliminado del repositorio: `src/`, `node_modules/`, `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `metadata.json`, `.env.local`.
    - 4. El archivo `.gitignore` se ha revisado y adaptado para un proyecto Go puro.
  - **Estado:** `SPECIFIED`

- **ID:** WP-002 - **Refactorización a Estructura Go Idiomática**
  - **Objetivo:** Reestructurar el prototipo Go a un layout que separe dominios y responsabilidades, según `ADR-009`, preservando el comportamiento actual.
  - **Dependencia:** `WP-001`
  - **Criterio de finalización:**
    - 1. Se han creado pruebas unitarias (`*_test.go`) para la lógica de `core/` (contratos, validación, ledger, compensación). Las respuestas simuladas de `core/app.go` se prueban como simulaciones identificadas, no como comportamiento real.
    - 2. El punto de entrada `main.go` se ha movido a `cmd/repairer/main.go`.
    - 3. La lógica de `core/` se ha refactorizado en los paquetes correspondientes dentro de `internal/` (app, domain, ledger, etc.), según el mapa de artefactos.
    - 4. El directorio `core/` ha sido eliminado.
    - 5. Se conservan los mismos casos, entradas, resultados esperados e invariantes después de trasladar las pruebas a los paquetes definitivos.
    - 6. `gofmt -l .` no devuelve ningún archivo pendiente de formato.
    - 7. `go build ./...` finaliza correctamente.
    - 8. `go vet ./...` finaliza correctamente.
    - 9. `go test ./...` ejecuta y aprueba todas las pruebas.
    - 10. Se ha actualizado `EVIDENCE.md` con la evidencia real (hashes, comandos y resultados) de los pasos 6-9.
  - **Estado:** `SPECIFIED`

- **ID:** WP-003 - **Catálogo tipado de operaciones**
  - **Objetivo:** Implementar un catálogo cerrado de operaciones en lugar de aceptar comandos de texto libre.
  - **Dependencia:** `WP-002`
  - **Requisito:** `FR-001`, `SEC-003`
  - **Criterio:** El ejecutor rechaza cualquier `OperationID` que no esté predefinido en el catálogo.
  - **Estado:** `SPECIFIED`

### Fase 2: Lógica de Núcleo y Seguridad

- **ID:** WP-004 - **Validación de planes y consentimiento**
  - **Objetivo:** Implementar la validación de `Plan` y la vinculación de una autorización a su `plan_digest`.
  - **Dependencia:** `WP-003`
  - **Requisito:** `FR-003`, `UX-005`
  - **Criterio:** El motor rechaza un plan si su digest no coincide con el de la autorización.
  - **Estado:** `SPECIFIED`

- **ID:** WP-005 - **Ledger persistente y verificable**
  - **Objetivo:** Implementar la escritura y lectura de un archivo de ledger, incluyendo la verificación de la cadena de hashes.
  - **Requisito:** `FR-009`, `SEC-005`
  - **Dependencia:** `WP-002`
  - **Criterio:** Al anexar, el motor verifica el hash del último registro existente.
  - **Estado:** `SPECIFIED`

- **ID:** WP-006 - **Compensación segura**
  - **Objetivo:** Reforzar la lógica de compensación con validación de rutas y pruebas de integración.
  - **Requisito:** `FR-005`
  - **Componente afectado:** `internal/compensation/`
  - **Criterio:** Las pruebas cubren casos de `path traversal` y fallos de restauración.
  - **Dependencia:** `WP-002`
  - **Estado:** `SPECIFIED`

### Fase 3: Integración y Entrega

- **ID:** WP-007 - **Adaptadores nativos de Windows**
  - **Objetivo:** Reemplazar todas las simulaciones con llamadas reales a APIs de Windows.
  - **Requisito:** `FR-012`
  - **Componente afectado:** `internal/platform/windows/` y `internal/app/`
  - **Dependencia:** `WP-002`
  - **Criterio:** `sys.get_os_info` y otros devuelven datos reales del sistema anfitrión.
  - **Estado:** `SPECIFIED`

- **ID:** WP-008 - **Interfaz nativa en Go**
  - **Objetivo:** Integrar Fyne e implementar una interfaz mínima verificable en Windows.
  - **Requisito:** `TECH-001`, `ADR-008`
  - **Dependencia:** `WP-002`
  - **Criterio de finalización:**
    - 1. La dependencia de Fyne se añade a `go.mod`.
    - 2. Se implementa una ventana básica que se inicia y se cierra correctamente.
    - 3. Se verifica la compilación en un entorno Windows AMD64 limpio con la cadena de herramientas CGo requerida.
    - 4. Se realiza una prueba de empaquetado reproducible.
    - 5. Se realiza una prueba básica de escalado de DPI en Windows.
    - 6. Se guarda la evidencia (logs de compilación, capturas) en la documentación del proyecto.
  - **Estado:** `SPECIFIED`

- **ID:** WP-009 - **Empaquetado, firma y actualización**
  - **Objetivo:** Crear el pipeline de CI/CD para construir, firmar y distribuir el ejecutable.
  - **Requisito:** `REL-001`, `REL-004`
  - **Criterio:** Se genera un ejecutable firmado en un entorno limpio.
  - **Estado:** `SPECIFIED`