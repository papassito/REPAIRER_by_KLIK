# Gobierno del baseline

## Propósito

Este documento define cómo se aprueban afirmaciones, requisitos, riesgos y versiones de REPAIRER by KLIK. Los nombres de responsables y canales están `UNKNOWN` y no se inventan.

## Fuentes de autoridad

En caso de conflicto se aplica este orden:

1. evidencia reproducible del comportamiento real;
2. contratos y requisitos aprobados;
3. decisiones arquitectónicas vigentes;
4. documentación operativa;
5. propuestas y ejemplos.

El código no convierte automáticamente un comportamiento inseguro en requisito. Si código y requisito difieren, se registra la desviación y se decide corregir uno de los dos.

## Roles

| Rol | Responsabilidad | Asignación actual |
|---|---|---|
| Propietario del producto | alcance, prioridades y aceptación | `PENDING_ASSIGNMENT` |
| Responsable técnico | arquitectura e implementación | `PENDING_ASSIGNMENT` |
| Responsable de seguridad | modelo de amenazas y riesgos | `PENDING_ASSIGNMENT` |
| Responsable de calidad | estrategia, entornos y evidencia | `PENDING_ASSIGNMENT` |
| Responsable de lanzamiento | procedencia, firma y distribución | `PENDING_ASSIGNMENT` |
| Mantenedor documental | coherencia y trazabilidad | `PENDING_ASSIGNMENT` |

Una persona puede asumir varios roles, pero la aprobación de riesgos `DESTRUCTIVE` o `IRREVERSIBLE` debería incluir una revisión independiente.

## Política Zero-Synthetic

### Promoción de estado

```text
PROPOSED -> SPECIFIED -> VERIFIED
                    \-> REJECTED o DEPRECATED
UNKNOWN  -> cualquiera, solo con información nueva
```

Para promover a `VERIFIED` se requiere:

- requisito o comportamiento identificado;
- enlace a código, binario o configuración exacta;
- prueba reproducible y entorno;
- resultado verificable y fecha;
- revisión proporcional al riesgo;
- documentación actualizada.

Una captura aislada, un comentario, un nombre de archivo o una afirmación de un modelo no son evidencia suficiente.

## Control de cambios

Todo cambio material debe incluir:

1. problema y alcance;
2. requisitos afectados;
3. clase de las operaciones afectadas;
4. análisis de seguridad, privacidad y recuperabilidad;
5. compatibilidad y migración;
6. plan y resultados de pruebas;
7. cambio documental y entrada de changelog;
8. aprobaciones requeridas.

Los cambios que introducen `DESTRUCTIVE` o `IRREVERSIBLE`, elevación, telemetría, actualizaciones, nuevos intérpretes o nuevos límites de confianza requieren revisión de seguridad.

## Registro de decisiones

Las decisiones arquitectónicas se mantienen en `ARCHITECTURE.md` mientras el volumen sea pequeño. Cada decisión debe tener:

- ID estable;
- contexto;
- decisión;
- alternativas relevantes;
- consecuencias y riesgos;
- estado y fecha;
- evidencia posterior cuando se implemente.

Si el número crece, se moverán a un directorio de ADR sin alterar sus IDs.

## Trazabilidad

Antes de una versión funcional debe existir una matriz con:

| Requisito | Operación/componente | Implementación | Prueba | Evidencia | Estado |
|---|---|---|---|---|---|
| `FR-002` | Catálogo | pendiente | pendiente | ninguna | `SPECIFIED` |

No se permiten filas `VERIFIED` con columnas de implementación o prueba vacías.

## Gestión de riesgos

Los riesgos se registran con probabilidad, impacto, responsable, mitigación, evidencia y riesgo residual. La aceptación de un riesgo:

- tiene fecha de expiración;
- identifica la versión y alcance;
- no modifica silenciosamente la clase de una operación;
- no autoriza lenguaje engañoso sobre seguridad o recuperación;
- se revisa antes de cada lanzamiento afectado.

## Versionado

- `docs-X.Y.Z` identifica versiones de este baseline mientras no exista producto verificable.
- La versión del producto se definirá al existir un proceso de lanzamiento.
- Una versión documental no implica una versión ejecutable equivalente.
- Cambios incompatibles en contratos incrementan su versión mayor.
- El changelog registra hechos integrados, no fechas o capacidades proyectadas.

## Criterios de lanzamiento

Un artefacto no se denomina estable ni listo para producción hasta que:

- el alcance y la compatibilidad estén sustentados por pruebas;
- todas las operaciones estén catalogadas y clasificadas;
- las puertas de `TESTING.md` estén satisfechas;
- el modelo de amenazas se haya revisado contra la implementación;
- existan procedencia, autenticidad e inventario de dependencias;
- instalación, actualización, fallo y desinstalación estén probados;
- soporte, licencia, privacidad y canal de vulnerabilidades estén definidos;
- la documentación no exceda las garantías demostradas.

## Revisión del baseline

El baseline debe revisarse cuando:

- se recibe o cambia el repositorio;
- se añade una operación o fuente de datos;
- cambia una clase de riesgo;
- se introduce elevación, red, actualización o telemetría;
- se modifica el formato del ledger o respaldo;
- aparece una vulnerabilidad relevante;
- se prepara una distribución pública.

## Estado de aprobaciones

Este baseline documenta decisiones solicitadas por el propietario, pero no contiene nombres, firmas ni una aprobación formal de lanzamiento. Su estado es **baseline documental inicial, pendiente de validación contra implementación**.
