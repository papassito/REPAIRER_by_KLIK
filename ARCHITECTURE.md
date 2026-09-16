# Arquitectura

## Estado arquitectónico

Esta es una arquitectura de referencia `SPECIFIED`. El lenguaje único aprobado es Go. Existe un prototipo de núcleo en Go, pero la implementación de la interfaz de usuario, la integración con el sistema operativo y las pruebas funcionales continúan `UNVERIFIED`.

## Atributos prioritarios

1. **Seguridad:** ninguna mutación sin clase, alcance y autorización.
2. **Recuperabilidad honesta:** solo prometer compensación cuando el estado previo existe y se prueba.
3. **Trazabilidad:** relacionar hallazgo, plan, autorización, intento y resultado.
4. **Mínimo privilegio:** separar presentación, análisis y ejecución privilegiada.
5. **Determinismo:** contratos cerrados y planes versionados.
6. **Observabilidad segura:** evidencia útil con datos minimizados.
7. **Evolución:** paquetes Go sustituibles detrás de contratos estables, sin fragmentar el producto entre runtimes.

## Contexto

### Principio Zero-Synthetic

REPAIRER tiene prohibido inventar datos. Cada pieza de información debe tener una procedencia clara que distinga, como mínimo, entre:
- **`OBSERVED`**: Leído directamente de una fuente de hardware o API del SO (ej. temperatura de un sensor).
- **`DECLARED`**: Obtenido de una especificación externa confiable (ej. TBW nominal de un SSD).
- **`DERIVED`**: Calculado matemáticamente a partir de otros datos observados o declarados (ej. porcentaje de TBW consumido).
- **`ESTIMATED`**: Una proyección basada en un historial de datos observados (ej. estimación de llenado de disco).
- **`UNKNOWN` / `UNSUPPORTED` / `ACCESS_DENIED`**: Estados que reflejan la incapacidad de obtener un dato, que nunca deben ser interpretados como un valor "cero" o "saludable".

### Modelo de Procedencia del Dato

Toda observación relevante debe poder asociarse con un modelo que capture su contexto completo: fuente (API, WMI, etc.), método, timestamp, confianza y las transformaciones aplicadas. Esto es fundamental para cumplir el requisito de explicar la evidencia que sustenta cada hallazgo.

### Flujo Lógico

El motor opera siguiendo una secuencia estricta que impide que un paso autorice indebidamente al siguiente. Diagnosticar no es reparar. Recomendar no es ejecutar.

```text
Usuario / Automatización autorizada
               │
               ▼
       Capa de presentación
               │ (Casos de uso tipados)
               ▼
   Planificación y política ─────> Informe previo
               │ plan autorizado
               ▼
      Límite de privilegios
               │ canal autenticado
               ▼
       Ejecutor controlado ─────> Windows / recursos objetivo
          │             │
          ▼             ▼
     Resultados     Ledger + respaldos
                           │
                            └──> Evaluación de compensación
                                   ├──> Compensación no autorizada
                                   │    └──> Intervención segura y cierre
                                   └──> Compensación autorizada
                                        └──> Ejecución de compensación
                                             └──> Verificación y cierre
```

El diagrama no prescribe procesos físicos. La implementación debe conservar los límites lógicos aunque combine componentes.

## Decisiones vigentes

### `ADR-001` — Identidad independiente

**Decisión:** el producto se denomina REPAIRER by KLIK y se gobierna de forma independiente.

**Consecuencia:** no se comparten versiones ni evidencias implícitamente. `AV` no forma parte del nombre ni del alcance actual.

### `ADR-002` — Clasificación exhaustiva de operaciones

**Decisión:** toda operación declara exactamente una clase: `READ_ONLY`, `REVERSIBLE`, `DESTRUCTIVE` o `IRREVERSIBLE`.

**Consecuencia:** la clase controla privilegios, consentimiento, compensación, automatización y pruebas. Una operación sin clase no es ejecutable.

### `ADR-003` — Plan separado de ejecución

**Decisión:** un plan es un artefacto declarativo, inerte, versionado y revisable.

**Consecuencia:** cualquier cambio en el plan invalida su autorización; el ejecutor solo acepta operaciones conocidas por catálogo.

### `ADR-004` — Compensación declarativa

**Decisión:** el ledger almacena hechos y descriptores tipados, nunca comandos ejecutables.

**Consecuencia:** el motor de compensación asigna un tipo permitido a una implementación Go interna. No evalúa shell, expresiones o plantillas procedentes del ledger.

### `ADR-005` — Integridad no equivale a inmutabilidad

**Decisión:** SHA-256 se describe como mecanismo de integridad dentro de supuestos explícitos.

**Consecuencia:** una cadena de hashes local no se anuncia como evidencia inmutable. Si el modelo de amenaza exige autenticidad o resistencia a sustitución, se necesitará una decisión adicional sobre firma o anclaje confiable.

### `ADR-006` — Garantías limitadas de eliminación

**Decisión:** el producto no promete borrado físico garantizado en SSD mediante sobrescritura de archivos.

**Consecuencia:** el resultado describe el nivel real de eliminación solicitado y verificado. La sanitización de dispositivos requerirá un módulo y contrato independientes.

### `ADR-007` — Arquitectura Go-only

**Decisión:** núcleo, interfaz, operaciones, contratos, auditoría, instalación, actualización, rollback y herramientas operativas del producto se implementan en Go.

**Consecuencia:** REPAIRER no es híbrido y no depende de C#, .NET, PowerShell o JavaScript/TypeScript. Las APIs concretas de Windows aún deben decidirse o verificarse, pero no pueden exigir otro runtime. Frameworks como Wails que empaquetan un frontend web no cumplen una interpretación estricta de este requisito y deben ser evaluados cuidadosamente.

### `ADR-008` — Framework de interfaz de usuario Fyne

**Contexto:** el requisito `TECH-001` exige que todo el producto, incluida la interfaz de usuario, se implemente en Go. La decisión del framework estaba pendiente, bloqueando el trabajo en la capa de presentación (ver `WP-008`). Se necesita una solución que se integre con Go y se ejecute en Windows, sin introducir runtimes como JavaScript o .NET.

**Decisión:** se adopta **Fyne** como el framework de interfaz de usuario para REPAIRER by KLIK.

**Alternativas consideradas:**
- **Wails:** Permite usar un frontend web (HTML/JS/TS). Se descartó explícitamente porque contradice la interpretación estricta de la arquitectura Go-only (`ADR-007`), que prohíbe runtimes auxiliares como los motores de navegador.

**Consecuencias:**
- **Dependencia de CGo:** Fyne utiliza CGo para interactuar con las librerías gráficas del sistema operativo. Esto introduce una dependencia de un compilador C (como GCC, disponible a través de MinGW-w64 en Windows) durante el proceso de **construcción** del ejecutable.
- **Experiencia del usuario final:** Como requisito de empaquetado, el usuario final no deberá instalar el compilador C ni Go, sino recibir un ejecutable autocontenido. Este proceso está pendiente de verificación.
- La interfaz de la aplicación tendrá un aspecto personalizado renderizado por Fyne, no el aspecto nativo de los controles de Windows. Este es un compromiso aceptado a cambio de la simplicidad y la pureza de la base de código Go.
- La implementación de `WP-008` añadirá la dependencia del toolkit Fyne (`fyne.io/fyne/v2`).
- La decisión desbloquea la planificación de `WP-008`, pero su ejecución permanece bloqueada por la refactorización estructural (`WP-002`).

### `ADR-009` — Estructura de Proyecto Adoptada

**Contexto:** El prototipo inicial tiene una estructura plana (`core/`, `main.go`) y está contaminado con artefactos de un proyecto web. Para cumplir con `ADR-007` y mejorar la mantenibilidad, se necesita una estructura de directorios que separe responsabilidades.

**Decisión:** Se adoptará la estructura de proyecto definida en `WORK_PLAN.md` (`WP-002`), que utiliza convenciones como `cmd/` para los ejecutables e `internal/` para el código privado del proyecto.

**Consecuencias:**
- El directorio `core/` será eliminado y su lógica distribuida en paquetes con responsabilidades claras dentro de `internal/` (ej: `internal/domain`, `internal/ledger`).
- El punto de entrada de la aplicación se moverá a `cmd/repairer/main.go`.
- Se facilita la separación entre la lógica de negocio (dominio), la lógica de la aplicación y las implementaciones de plataforma (UI, adaptadores de Windows).
- Esta refactorización es un prerrequisito para añadir nuevas funcionalidades, incluyendo la interfaz de usuario.

## Modelo de operación

```text
DRAFT
  └─> VALIDATED
        └─> AUTHORIZED
              └─> PREPARING
                    ├─> REJECTED
                    └─> READY
                          └─> RUNNING
                                ├─> SUCCEEDED_VERIFIED
                                ├─> SUCCEEDED_UNVERIFIED
                                ├─> FAILED_NO_CHANGE
                                ├─> FAILED_PARTIAL
                                └─> CANCELLED
```

## Decisiones pendientes

Antes de implementar deben resolverse, con evidencia y propietario:

- formatos físicos y mecanismo de persistencia;
- versión de Go y estrategia de distribución;
- proceso o servicio elevado y su canal autenticado;
- compatibilidad exacta con Windows;
- estrategia de firma y actualización;
- localización y accesibilidad;

## Propuestas para Evaluación

### `PROPOSAL-001` — Ciclo de Vida E2E para Operación Reversible

**Origen:** Este flujo se basa en el análisis de un prototipo de frontend no conforme y está `PROPOSED`. **No es un flujo canónico ni verificado**. Cada paso debe ser validado y trazado contra los requisitos (`REQUIREMENTS.md`), contratos (`CONTRACTS.md`) y controles de seguridad (`SECURITY.md`) antes de su implementación.

1.  **Identificar Host Target:** Detección de sistema operativo, hostname y arquitectura.
2.  **Recopilar Observaciones (`READ_ONLY`):** Sondeo del estado del sistema sin alterarlo.
3.  **Generar Plan Inerte:** Definición de operaciones y contratos sin ejecución.
4.  **Clasificar Operaciones:** Asignación de una clase de riesgo única (`REVERSIBLE`, etc.).
5.  **Validar Plan y Precondiciones:** Comprobación de privilegios y concordancia.
6.  **Explicar Alcance y Efectos:** Visualización de riesgos y políticas de rollback.
7.  **Recoger Autorización:** Vinculación de un consentimiento de un solo uso al digest del plan.
8.  **Preparar Backup de Compensación:** Creación de material de respaldo. La existencia y la integridad (SHA-256) del respaldo se verifican, pero esto no garantiza su restaurabilidad.
9.  **Validar Restaurabilidad del Backup:** Se requiere una prueba controlada para verificar que el respaldo es funcional.
10. **Ejecutar Mutación:** Modificación del objetivo usando APIs de Windows invocadas mediante implementaciones escritas en Go.
11. **Verificar Estado Posterior:** Comparación del estado final con las postcondiciones esperadas.
12. **Escribir Registro Declarativo:** Emisión de un registro declarativo versionado en el ledger con el descriptor de compensación.
13. **Consolidar Cadena de Ledger:** Vinculación del hash del registro anterior para detección de alteraciones.
14. **Cerrar Sesión:** Liberación de recursos y registro de auditoría final.

**Flujo de Compensación (rama separada):**

15. **Evaluar Fallo o Solicitud:** Tras un fallo parcial o una solicitud explícita, se evalúa la posibilidad de compensación.
16. **Autorizar Compensación:** Se requiere una autorización separada para ejecutar el rollback.
17. **Ejecutar Compensación:** Lectura del descriptor, verificación del backup y restauración.
18. **Verificar Compensación:** Comprobación de que se ha alcanzado el estado de compensación esperado bajo precondiciones verificadas.

## Semántica de compensación

La compensación no es una transacción ACID ni un rollback atómico del sistema operativo. Es una acción correctiva explícita, potencialmente falible, sustentada por estado previo verificable.

- El orden inverso puede ser necesario para dependencias, pero no se declara “LIFO real” sin pruebas de cada tipo de operación.
- Las compensaciones deben ser idempotentes o declarar su comportamiento de reintento.
- La restauración valida precondiciones actuales; no sobrescribe cambios posteriores sin política y consentimiento.
- Un resultado parcial conserva evidencia y solicita intervención segura.
