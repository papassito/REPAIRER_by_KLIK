# REPAIRER by KLIK

**REPAIRER by KLIK** es una herramienta de diagnóstico, conocimiento, mantenimiento y reparación controlada para sistemas Windows.

Su objetivo es construir una representación verificable del estado real de una PC, detectar problemas y riesgos, explicar sus causas cuando exista evidencia suficiente, recomendar acciones y ejecutar únicamente las operaciones autorizadas que correspondan.

El producto separa estrictamente las fases de su operación:

**OBSERVAR → NORMALIZAR → ANALIZAR → DETECTAR → EXPLICAR → RECOMENDAR → PLANIFICAR → AUTORIZAR → EJECUTAR → VERIFICAR → REGISTRAR**

## Estado del Proyecto

- **Estado de Implementación:** `SPECIFIED` / `IMPLEMENTED_UNVERIFIED`
- **Arquitectura:** `Go-only`

El proyecto ha completado una refactorización arquitectónica y una fase de fortalecimiento documental. La estructura del código es ahora idiomática y modular. Las capacidades de diagnóstico (inventario, salud de almacenamiento, etc.) están formalmente especificadas, pero su implementación está pendiente. El núcleo de ejecución y criptografía existe como un prototipo funcional (`IMPLEMENTED_UNVERIFIED`) pero carece de una suite de pruebas completa.

El trabajo actual se centra en la implementación de las capacidades de diagnóstico, como se detalla en el `WORK_PLAN.md`.

Para más detalles, consulte los documentos enlazados a continuación.

## Cómo Empezar

El proyecto puede ser compilado, pero la funcionalidad actual se limita a una demo de línea de comandos que ejecuta operaciones de archivo en un entorno temporal.

**Requisitos:**
- Go 1.21 o superior.

**Compilación:**

Para verificar que todos los paquetes compilan correctamente, ejecute:
```sh
go build ./...
```

## Documentación Principal

- **Plan de Trabajo (`WORK_PLAN.md`):** Fases y tareas de desarrollo.
- **Decisiones de Arquitectura (`ARCHITECTURE.md`):** Decisiones clave que gobiernan el diseño.
- **Requisitos (`REQUIREMENTS.md`):** Requisitos funcionales y no funcionales.
- **Historial de Cambios (`CHANGELOG.md`):** Registro de cambios por versión.
