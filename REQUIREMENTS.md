# Requisitos

## Convenciones

- **MUST / DEBE:** obligatorio para conformidad.
- **SHOULD / DEBERÍA:** esperado salvo excepción justificada.
- **MAY / PUEDE:** opcional.
- Todos los requisitos de esta versión están `SPECIFIED`, no `VERIFIED`.
- La evidencia mínima de cumplimiento debe enlazar implementación, prueba reproducible, resultado y fecha.

## Requisitos funcionales

| ID | Requisito | Criterio mínimo de aceptación |
|---|---|---|
| `FR-001` | El sistema DEBE identificar cada operación mediante un ID estable y una versión de contrato. | El catálogo rechaza IDs duplicados y versiones desconocidas. |
| `FR-002` | Cada operación DEBE declarar exactamente una clase: `READ_ONLY`, `REVERSIBLE`, `DESTRUCTIVE` o `IRREVERSIBLE`. | No puede planificarse una operación sin clase. |
| `FR-003` | El análisis y la planificación DEBEN estar separados de la ejecución. | Un plan puede revisarse y cancelarse sin producir cambios. |
| `FR-004` | Toda ejecución DEBE limitarse a objetivos explícitos y normalizados. | Las pruebas demuestran rechazo de objetivos ambiguos, inexistentes o fuera de alcance. |
| `FR-005` | Una operación `REVERSIBLE` DEBE preparar y validar el estado de compensación antes de modificar el objetivo. | Si la preparación falla, la mutación no comienza. |
| `FR-006` | Una operación `REVERSIBLE` DEBE verificar el resultado de su compensación. | El resultado diferencia éxito, fallo y estado indeterminado. |
| `FR-007` | Las operaciones `DESTRUCTIVE` e `IRREVERSIBLE` DEBEN permanecer fuera del rollback automático. | El motor de compensación las rechaza por contrato. |
| `FR-008` | La ejecución DEBE producir un resultado estructurado y un registro auditable. | Cada intento tiene correlación, tiempo, clase, objetivo, resultado y error saneado. |
| `FR-009` | El ledger DEBE contener registros declarativos, nunca scripts, fragmentos de shell, expresiones evaluables ni comandos. | La validación de esquema rechaza campos o valores ejecutables fuera del vocabulario permitido. |
| `FR-010` | El sistema DEBE poder generar un informe previo con operaciones, objetivos, efectos previstos, permisos y garantías de recuperación. | El usuario puede inspeccionarlo antes de autorizar cambios. |
| `FR-011` | El sistema DEBE soportar cancelación segura entre operaciones. | La cancelación no inicia nuevas mutaciones y registra el estado parcial. |
| `FR-012` | Los diagnósticos DEBEN distinguir “no hallado”, “no accesible”, “no soportado” y “error”. | Ninguno de esos estados se presenta como estado saludable. |

## Consentimiento y experiencia de usuario

| ID | Requisito | Criterio mínimo de aceptación |
|---|---|---|
| `UX-001` | Antes de ejecutar, la interfaz DEBE mostrar clase, alcance y efecto de cada operación. | La información está disponible sin abrir registros técnicos. |
| `UX-002` | `READ_ONLY` puede usar consentimiento de sesión, siempre que no solicite elevación no explicada. | El alcance de lectura queda visible y registrado. |
| `UX-003` | `REVERSIBLE` DEBE explicar qué se respalda, dónde, durante cuánto tiempo y cuándo puede fallar la restauración. | La confirmación recoge la versión del plan. |
| `UX-004` | `DESTRUCTIVE` DEBE requerir confirmación explícita por lote y no puede seleccionarse por defecto. | Prueba de interfaz confirma opt-in y resumen de objetivos. |
| `UX-005` | `IRREVERSIBLE` DEBE exigir confirmación reforzada ligada al plan exacto, caducar y prohibir ejecución desatendida por defecto. | Un token viejo o emitido para otro plan es rechazado. |
| `UX-006` | El producto DEBE evitar lenguaje absoluto sobre seguridad, recuperación o borrado físico. | Revisión de textos no encuentra garantías incompatibles con el contrato. |

## Seguridad y privacidad

| ID | Requisito | Criterio mínimo de aceptación |
|---|---|---|
| `SEC-001` | Debe aplicarse mínimo privilegio y elevar solo la operación que lo necesite. | Una sesión de diagnóstico no hereda elevación global innecesaria. |
| `SEC-002` | Entradas, rutas, identificadores y registros importados DEBEN tratarse como no confiables. | Casos de traversal, enlaces, sustitución y campos extra son rechazados o contenidos. |
| `SEC-003` | La ejecución DEBE usar llamadas tipadas o argumentos estructurados; no construir líneas de comando desde entradas no confiables. | Pruebas de inyección no alteran el comando ni su alcance. |
| `SEC-004` | El ledger DEBE ser validado contra un esquema cerrado y versionado. | Campos obligatorios, enums y límites son comprobados antes de uso. |
| `SEC-005` | SHA-256 PUEDE usarse para integridad, pero no DEBE describirse como inmutabilidad por sí solo. | La documentación y UI usan “verificación de integridad”. |
| `SEC-006` | Secretos, tokens, contenido privado y rutas innecesarias no DEBEN registrarse. | Pruebas de redacción cubren errores y logs. |
| `SEC-007` | Respaldos y ledger DEBEN tener permisos restrictivos, retención definida y eliminación controlada. | Una cuenta no autorizada no puede leer o sustituirlos. |
| `SEC-008` | El producto DEBE fallar de forma cerrada cuando no puede determinar clase, objetivo, privilegio o validez del plan. | No se ejecuta ninguna mutación en estados ambiguos. |

## Requisitos de borrado y almacenamiento

| ID | Requisito | Criterio mínimo de aceptación |
|---|---|---|
| `DATA-001` | Ninguna función DEBE prometer eliminación física garantizada de un archivo en SSD mediante sobrescritura. | Mensajes y manuales declaran la limitación. |
| `DATA-002` | Una operación de eliminación DEBE declarar su garantía: eliminación lógica, solicitud al sistema operativo, sanitización del dispositivo por mecanismo soportado o ninguna garantía adicional. | El resultado incluye el nivel realmente solicitado y el observado. |
| `DATA-003` | La clasificación `IRREVERSIBLE` DEBE significar “sin rollback soportado por REPAIRER”, no “imposible de recuperar físicamente”. | Contratos y UI mantienen la distinción. |
| `DATA-004` | La sanitización de dispositivo, si se incorpora, DEBE ser un flujo separado, específico por tecnología y validado; no se infiere de una sobrescritura de archivo. | La operación tiene requisitos y pruebas propios. |

## Confiabilidad y operación

| ID | Requisito | Criterio mínimo de aceptación |
|---|---|---|
| `NFR-001` | Las operaciones DEBEN ser deterministas respecto de su plan o declarar las fuentes de variación. | Reejecuciones controladas producen resultados equivalentes. |
| `NFR-002` | Los identificadores de tiempo DEBEN usar UTC y formato inequívoco. | Los registros pueden ordenarse sin depender de configuración regional. |
| `NFR-003` | Los planes DEBEN incluir condiciones previas y una huella de su contenido. | Cambios posteriores invalidan la autorización. |
| `NFR-004` | Las operaciones mutantes DEBEN ser idempotentes o declarar y probar su política de reintento. | Un reintento no amplía silenciosamente el alcance. |
| `NFR-005` | Los fallos parciales DEBEN quedar visibles y no resumirse como éxito global. | El informe conserva el estado individual de cada operación. |
| `NFR-006` | La compatibilidad con versiones de Windows DEBE publicarse solo después de pruebas reproducibles por versión y arquitectura. | La matriz enlaza resultados verificables. |
| `NFR-007` | El producto DEBE funcionar con localización segura e independiente del idioma para IDs y contratos. | Cambiar idioma no cambia semántica ni parsing. |

## Arquitectura tecnológica

| ID | Requisito | Criterio mínimo de aceptación |
|---|---|---|
| `TECH-001` | El producto DEBE implementarse íntegramente en Go. | Todo componente distribuido y todo punto de entrada operativo pertenecen al módulo o binarios Go aprobados. |
| `TECH-002` | El producto NO DEBE requerir C#, .NET ni PowerShell para instalarse, actualizarse, ejecutarse, diagnosticar, modificar o compensar cambios. | Una instalación limpia funciona sin esos runtimes o scripts como dependencias de REPAIRER. |
| `TECH-003` | Instalador, actualizador, migraciones, rollback y herramientas obligatorias DEBEN estar implementados en Go cuando formen parte del producto. | La revisión del paquete no encuentra lógica operativa distribuida en otros lenguajes. |
| `TECH-004` | Las integraciones con Windows DEBEN exponerse mediante código Go y contratos tipados, sin generar scripts externos. | Las pruebas demuestran argumentos estructurados y ausencia de archivos de script generados. |
| `TECH-005` | Las dependencias Go DEBEN fijarse, inventariarse y verificarse antes de una entrega. | El módulo, checksums, licencias e inventario coinciden con el artefacto publicado. |

## Requisitos de entrega y evidencia

| ID | Requisito | Criterio mínimo de aceptación |
|---|---|---|
| `REL-001` | Una versión publicable DEBE ser reproducible o documentar completamente su procedencia de compilación. | El paquete enlaza commit, entorno, dependencias y resultado. |
| `REL-002` | Una capacidad solo puede marcarse `VERIFIED` con evidencia trazable. | La matriz de conformidad no contiene celdas sin referencia. |
| `REL-003` | Toda dependencia y licencia DEBE inventariarse antes de distribuir. | Existe SBOM o inventario equivalente revisado. |
| `REL-004` | El paquete DEBE estar firmado o acompañado de un mecanismo confiable de autenticidad antes de producción. | La verificación se prueba desde un entorno limpio. |

## Fuera de alcance del baseline

- Antivirus, protección en tiempo real o respuesta autónoma a malware.
- Análisis PE, cálculo de entropía o clasificación forense específica.
- Frameworks o runtimes distintos de Go como parte de la arquitectura del producto.
- Limpieza automática masiva sin plan y consentimiento.
- Promesas de recuperación total o eliminación física garantizada.
