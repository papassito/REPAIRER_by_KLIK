# REPAIRER by KLIK

**REPAIRER by KLIK** es un marco de software diseñado para ofrecer diagnóstico, planificación y ejecución controlada de operaciones de mantenimiento en sistemas Windows.

El objetivo es proporcionar una herramienta segura y trazable que separe el análisis de la ejecución, garantizando que solo se realicen cambios autorizados y clasificados según su riesgo.

## Estado del Proyecto

- **Estado de Implementación:** `PROTOTYPE_UNVERIFIED` / `BUILD_RECOVERED`
- **Arquitectura:** `Go-only`

El proyecto se encuentra en una fase inicial. Existe un prototipo funcional del núcleo lógico escrito en Go, cuyo estado de compilación ha sido verificado (ver `EVIDENCE.md`). Sin embargo, carece de pruebas automatizadas y de una interfaz de usuario integrada.

Actualmente, el trabajo se centra en la refactorización del código a una estructura idiomática de Go, como se detalla en el paquete de trabajo `WP-002`. Esta es una condición previa para cualquier desarrollo de nuevas funcionalidades.

Para más detalles, consulte la Arquitectura del Proyecto.

## Cómo Empezar

El prototipo actual no tiene una funcionalidad de cara al usuario, pero puede ser compilado.

**Requisitos:**
- Go 1.21.5 o superior.

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
