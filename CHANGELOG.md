# Changelog

Todas las modificaciones notables y verificadas de REPAIRER by KLIK se registrarán aquí.

Este archivo no es un roadmap. No declara funciones implementadas sin evidencia.

El formato sigue categorías comprensibles —añadido, cambiado, corregido, seguridad y documentación— y separa la versión documental de una versión del producto.

## [Unreleased]

- **ID:** `FE-VALIDATION-SETUP-01`
  - **Añadido:**
    - Se ha creado el módulo `src/utils/orderValidator.ts` para centralizar las reglas de negocio de las órdenes de reparación en el frontend.
    - Se ha añadido el archivo `tsconfig.json` con la configuración necesaria para compilar un proyecto React + TypeScript con Vite.
    - Se han instalado las dependencias de desarrollo `@types/react` y `@types/react-dom`.
  - **Cambiado:**
    - Se ha refactorizado el componente `src/components/workbench/TechnicianWorkbench.tsx` para convertirlo en un formulario controlado que utiliza el nuevo validador.
    - El `TechnicianWorkbench` ahora muestra una lista de errores de validación al usuario, mejorando la experiencia y la calidad de los datos.
  - **Corregido:**
    - Se ha corregido la interfaz `QCItem` en `src/types/repairer.ts` para alinearla con los datos de prueba, solucionando errores de compilación de TypeScript.
    - Se han resuelto todos los errores de compilación del frontend, permitiendo que `npx tsc --noEmit` se ejecute limpiamente.
  - **Documentación:**
    - Se ha actualizado `CHANGELOG.md` para registrar el progreso en la capa de presentación.

- **ID:** `DOCS-BASELINE-V2.0`
  - **Documentación:**
    - Se ha realizado una actualización y fortalecimiento masivo de toda la documentación del proyecto.
    - Se han añadido dominios de diagnóstico formales: Inventario, Salud de Almacenamiento, Red, Puertos, Salud de Windows y Rendimiento.
    - Se ha reforzado el principio **Zero-Synthetic** y se ha formalizado un modelo de **Procedencia del Dato**.
    - Se han añadido más de 40 nuevos requisitos funcionales y se ha expandido la matriz de conformidad.
    - Se han añadido nuevos contratos para las entidades de diagnóstico (`Observation`, `Finding`, etc.).
- **ID:** `SEC-ARCH-FIXES-02`
  - **Arquitectura:**
    - **ENGINE-001:** Se ha eliminado el `switch op.OperationID` y se ha refactorizado el motor para usar un `OperationRegistry` dinámico con una interfaz `OperationHandler`. Esto resuelve el principal problema de extensibilidad.
  - **Seguridad:**
    - **TOCTOU:** Se ha añadido revalidación de rutas inmediatamente antes de las operaciones de escritura (`os.WriteFile`) y renombrado (`os.Rename`) para mitigar las vulnerabilidades de "Time-of-check to time-of-use".
    - **SEC-001:** Se ha mejorado la validación de nombres de archivo reservados de Windows para incluir casos con extensiones (ej. `CON.txt`).
  - **Corregido:**
    - **Persistencia de Claves:** Se ha corregido el error crítico que causaba que las claves de firma se guardaran en un directorio temporal que era eliminado. Las claves ahora persisten entre ejecuciones en el directorio de configuración del usuario.
  - **Añadido:**
    - **Contratos:** Se ha creado el archivo `core/contracts.go` para definir explícitamente las estructuras de datos y se ha incrementado `LedgerSchemaVersion` a `1.1` para reflejar la adición de firmas.
  - **Documentación:**
    - Se ha actualizado `CHANGELOG.md` para reflejar estas correcciones críticas.

- **ID:** `SEC-CRITICAL-FIXES-01`
  - **Seguridad:**
    - **SEC-001:** Se ha refactorizado `core/security/path_validator.go` para corregir un error crítico que impedía validar rutas de archivos no existentes. La validación de `scope` ahora previene falsos positivos (ej. `C:\data` vs `C:\database`). Se han añadido comprobaciones para nombres de dispositivo reservados de Windows (`CON`, `PRN`, etc.).
    - **LEDGER-003:** Se ha corregido un bug crítico en `core/signature.go` que causaba que la firma y verificación fallaran debido a no manejar el prefijo `sha256:` en los hashes.
  - **Corregido:**
    - Se ha implementado un mecanismo de persistencia de claves basado en archivos para el prototipo, evitando que el ledger se invalide en cada reinicio.
  - **Añadido:**
    - **TEST-001:** Se ha creado la suite de pruebas `core/security/security_test.go` para validar la nueva lógica de seguridad de rutas y proteger contra regresiones.
  - **Documentación:**
    - Se ha actualizado `CONTRACTS.md` para reflejar el nuevo campo `Signature` y se ha incrementado la versión del esquema del ledger.
    - Se ha actualizado `ARCHITECTURE.md` para documentar la decisión de persistencia de claves.
    - Se ha actualizado `SECURITY.md` para reflejar los controles de seguridad de rutas mejorados.

- Existe código fuente correspondiente a un prototipo Go.
- La compilación y el análisis estático requieren evidencia reproducible válida.
- No existen archivos de pruebas automatizadas.
- No existe evidencia documental de una validación funcional sobre un entorno Windows limpio.
- No existe evidencia de implementación de la interfaz Fyne.

## [docs-0.4.0] - 2026-09-15

### Corregido
- **Estado del Repositorio:** Se ha recuperado el proyecto a un estado compilable (`BUILD_RECOVERED`) tras un intento fallido de implementación de UI. Se confirmó la ubicación de los archivos de UI en una carpeta de respaldo y se verificó la integridad del prototipo Go.

### Añadido
- **Evidencia (`EVIDENCE.md`):** Se ha añadido el registro `E-001` con la evidencia reproducible de la compilación exitosa del prototipo Go tras la recuperación.

## [docs-0.4.0] - 2026-09-15

### Corregido
- **Estado del Repositorio:** Se ha recuperado el proyecto a un estado compilable tras un intento fallido de implementación de UI. Se eliminaron los artefactos de UI rotos y se restauró el punto de entrada `main.go`.

### Añadido
- **Evidencia (`EVIDENCE.md`):** Se ha añadido el registro `E-001` con la evidencia reproducible de la compilación exitosa del prototipo Go tras la recuperación.

## [docs-0.3.4] - 2026-09-15

### Cambiado
- **Plan de Trabajo (`WORK_PLAN.md`):** Se precisa el criterio de refactorización de pruebas (`WP-002`) para permitir cambios de importación, y se especifica el comando `gofmt -l .` para la puerta de calidad de formato.

### Corregido
- **Mapa de Artefactos (`MAP.md`):** Se elimina una línea de texto fuera de lugar que afectaba la estructura del documento.

## [docs-0.3.3] - 2026-09-15

### Cambiado
- **Plan de Trabajo (`WORK_PLAN.md`):** Se refinan los criterios de aceptación de la refactorización (`WP-002`) para exigir pruebas unitarias sobre la lógica de negocio (contratos, validación, ledger) y para incluir la ejecución exitosa de `gofmt`, `go build`, `go vet` y `go test` como puertas de calidad.
- **Mapa de Artefactos (`MAP.md`):** Se ajusta la estructura de directorios objetivo para que los directorios `testdata/` se ubiquen dentro de los paquetes `internal/` que los utilizan, en lugar de en la raíz del proyecto.

## [docs-0.3.2] - 2026-09-15

### Cambiado
- **Mapa de Artefactos (`MAP.md`):** Se actualiza el mapa de artefactos previsto con la estructura de directorios Go detallada que servirá como objetivo para la refactorización (`WP-002`).

## [docs-0.3.1] - 2026-09-15

### Cambiado
- **Plan de Trabajo (`WORK_PLAN.md`):** Se refina el plan de refactorización (`WP-002`) para exigir la creación de pruebas que congelen el comportamiento actual *antes* de reestructurar el código. Se actualizan los paquetes de trabajo dependientes (`WP-006`, `WP-007`) para apuntar a la nueva estructura de directorios.

### Corregido
- **Decisiones de Arquitectura (`ARCHITECTURE.md`):** Se corrige `ADR-008` para reflejar que la implementación de la UI (`WP-008`) está bloqueada por la refactorización (`WP-002`). Se ajusta la redacción de `ADR-009` para describir la nueva estructura de proyecto como "adoptada" en lugar de "estándar".

## [docs-0.3.0] - 2026-09-15

### Añadido
- **Decisión de Arquitectura (`ADR-009`):** Se define una estructura de proyecto Go idiomática (`cmd/`, `internal/`) como objetivo para la refactorización.

### Cambiado
- **Plan de Trabajo (`WORK_PLAN.md`):** Se actualizan `WP-001` y `WP-002` para detallar el proceso de saneamiento del repositorio y la refactorización del código Go a la nueva estructura. Estos paquetes de trabajo se establecen como bloqueantes para la implementación de la UI.

### Corregido
- **Registro de Evidencia (`EVIDENCE.md`):** Se elimina el contenido sintético y los placeholders. El archivo ahora refleja correctamente que no existe evidencia válida registrada.

## [docs-0.2.1] - 2026-09-15

### Añadido
- **Estado de verificación:** se identificó código fuente Go, pero la compilación, el análisis estático y la ejecución de pruebas requieren un registro reproducible sin placeholders.

### Cambiado
- **Decisión de Arquitectura (`ADR-008`):** Se clarifica que Fyne **requiere CGo** y un compilador C para la construcción, corrigiendo la afirmación anterior de que se evitaba CGo. La arquitectura de la aplicación sigue siendo Go-only.
- **Plan de Trabajo (`WORK_PLAN.md`):** Se detallan los criterios de aceptación para la implementación de la interfaz (`WP-008`), incluyendo compilación, empaquetado y pruebas de escalado.

### Corregido
- **Afirmaciones Zero-Synthetic:** se corrigieron `README.md` y `ARCHITECTURE.md` para registrar que existe un prototipo Go, pero su compilación reproducible, la interfaz Fyne y las pruebas funcionales permanecen pendientes de evidencia válida.

### Documentación
- Se registran los artefactos de desarrollo web (`src/`, `node_modules/`, `package.json`, etc.) como **pendientes de eliminación** para cumplir con `TECH-001`, en lugar de marcarlos incorrectamente como ya eliminados.

## [docs-0.2.0] - 2026-09-15

### Añadido
- **Decisión de Arquitectura (`ADR-008`):** Se adopta formalmente **Fyne** como el framework de interfaz de usuario, cumpliendo con la arquitectura Go-only y desbloqueando el trabajo en la capa de presentación.

### Cambiado
- **Plan de Trabajo (`WORK_PLAN.md`):** Se reestructura completamente el plan en fases claras (WP-001 a WP-009), comenzando con el saneamiento del proyecto y la definición de una estructura Go-only limpia.
- **Prototipo del Núcleo (`core/`):** Se refina el prototipo para marcar explícitamente las funciones como simulaciones y se mejora el despachador de comandos para usar coincidencias exactas por seguridad.

### Corregido
- **Matriz de Conformidad (`CONFORMANCE_MATRIX.md`):** Se reclasifican los requisitos de `VERIFIED` a `IMPLEMENTED_UNVERIFIED` para reflejar con precisión el estado del prototipo, que carece de pruebas automatizadas y evidencia de ejecución real.
- **Contaminación de Proyectos:** Se eliminan del código Go (`core/app.go`) todas las referencias y lógica pertenecientes a un proyecto ajeno.

### Identificado
- **Artefactos web no conformes:** se identificaron archivos y directorios relacionados con TypeScript, Vite y Node.js. Su eliminación permanece pendiente en `WP-001`.

### Documentación
- Se actualizan `README.md`, `ARCHITECTURE.md` y otros documentos para reflejar la selección del framework Fyne, el estado real del prototipo y el nuevo plan de trabajo.

## [docs-0.1.1] - 2026-09-14

### Arquitectura

- Confirmada la arquitectura Go-only para todo el producto.
- Excluidos C#, .NET y PowerShell del producto, instalador, actualizador, rollback y herramientas operativas obligatorias.
- Mantenido el framework de interfaz y las APIs concretas de Windows como decisiones pendientes, sujetas a implementación íntegra en Go.

### Estado funcional

- La decisión Go-only está `SPECIFIED`; la implementación permanece `UNKNOWN` hasta auditar el repositorio.

## [docs-0.1.0] - 2026-09-14

### Documentación

- Creado el baseline documental inicial de REPAIRER by KLIK.
- Definida la independencia formal del producto respecto de otros proyectos.
- Confirmado **REPAIRER by KLIK** como nombre único del producto; cualquier módulo futuro requerirá aprobación y requisitos propios.
- Adoptado el principio Zero-Synthetic y los estados `VERIFIED`, `SPECIFIED`, `PROPOSED`, `UNKNOWN` y `OUT_OF_SCOPE`.
- Definidas las clases de operación `READ_ONLY`, `REVERSIBLE`, `DESTRUCTIVE` e `IRREVERSIBLE`.
- Especificado un ledger declarativo sin comandos ejecutables.
- Aclarado que SHA-256 aporta verificación de integridad bajo supuestos definidos, no inmutabilidad por sí solo.
- Aclarado que la sobrescritura de archivos no permite garantizar borrado físico en SSD.
- Añadidos requisitos, arquitectura, contratos, mapa, navegación, componentes, seguridad, pruebas y gobierno.

### Estado funcional

- No se añaden ni se afirman capacidades ejecutables en esta versión documental.

## Reglas de mantenimiento

- Una función solo aparece como “añadida” después de enlazar implementación y pruebas.
- Una corrección debe identificar el comportamiento anterior, el cambio y la prueba de regresión.
- Los cambios de seguridad no deben revelar detalles explotables antes de contar con mitigación y coordinación.
- Las ideas futuras pertenecen a requisitos `PROPOSED` o a un roadmap separado.
- Las entradas usan fecha real de integración o publicación, no una fecha proyectada.
