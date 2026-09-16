# Proyectos y fronteras

## Propósito

Este documento evita mezclar identidades, requisitos, evidencias o entregables que pertenecen a productos diferentes.

## Producto principal

### REPAIRER by KLIK

- **Tipo:** producto principal.
- **Estado documental:** `SPECIFIED`.
- **Estado de implementación:** `PROTOTYPE_UNVERIFIED`. Existe código fuente Go, pero carece de pruebas y evidencia funcional.
- **Objetivo:** ofrecer un marco seguro para diagnóstico, planificación y ejecución controlada de mantenimiento en Windows.
- **Arquitectura tecnológica:** Go-only, `SPECIFIED`; implementación `PROTOTYPE_UNVERIFIED`.
- **Autoridad documental:** los archivos enlazados desde `README.md` en este paquete.
- **Historial de versiones:** `CHANGELOG.md`.
- **Bitácora de trabajo:** `HISTORIAL DE ACTIVIDADES.MD`.

## Módulos del producto

Los siguientes son dominios lógicos, no pruebas de que existan componentes de software:

| Módulo | Estado | Responsabilidad prevista |
|---|---|---|
| Inventario y diagnóstico | `SPECIFIED` | Recopilar observaciones sin alterar el objetivo. |
| Planificador de operaciones | `SPECIFIED` | Convertir hallazgos en un plan clasificable y revisable. |
| Ejecutor controlado | `SPECIFIED` | Aplicar únicamente operaciones autorizadas. |
| Respaldo y compensación | `SPECIFIED` | Preparar y validar compensaciones para acciones reversibles. |
| Ledger y auditoría | `SPECIFIED` | Registrar hechos y referencias mediante datos declarativos. |
| Presentación e interacción | `SPECIFIED` | Explicar alcance, riesgo, progreso y resultado; debe implementarse en Go. |
| Antivirus | `PROPOSED` | Posible módulo futuro; no está aprobado ni incluido en el producto actual. |

## Reglas para crear un subproyecto

Un área solo se convierte en subproyecto cuando dispone de:

1. propietario y alcance;
2. requisitos identificados;
3. límites de datos y privilegios;
4. catálogo de operaciones y clases de riesgo;
5. plan de pruebas;
6. estrategia de versión y entrega;
7. decisión registrada en el changelog y, si cambia la arquitectura, en `ARCHITECTURE.md`.

## Nombres y artefactos

- El nombre visible debe ser **REPAIRER by KLIK**.
- El código del producto y sus herramientas operativas obligatorias deben ser Go; una dependencia de ejecución en C#, .NET o PowerShell no es conforme.
- Los identificadores internos no deben usar `AV` salvo dentro de un módulo antivirus futuro formalmente aprobado.
- Un paquete de entrega debe incluir su versión, checksum publicado por un canal confiable, procedencia de compilación y resultados de verificación. Esta regla es un requisito; no afirma que el mecanismo exista.

## Criterio de independencia

Dos proyectos se consideran separados cuando pueden versionarse, probarse, desplegarse y retirarse sin modificar el otro.
