# Mapa del producto

## Mapa funcional

El flujo lógico del producto se centra en transformar observaciones de bajo nivel en conocimiento accionable y seguro.

```text
Observación (Inventario, Salud, Red, etc.) [READ_ONLY]
  └─ Normalización y Análisis
       └─ Hallazgos (Findings)
            └─ Motor de Recomendaciones
                 └─ Planificador
                      └─ Plan de Mantenimiento (inerte)
                           └─ Consentimiento y Autorización
                                └─ Ejecutor Controlado
                                     ├─ Operación Reversible ──> Compensación
                                     └─ Operación Irreversible
                                          └─ Verificación Posterior
                                               └─ Ledger y Resultado
```

Este diagrama es una arquitectura objetivo `SPECIFIED`; no representa módulos verificados.

## Flujo de una operación

1. **Descubrir:** recopilar datos con el menor privilegio posible.
2. **Proponer:** crear un plan inerte y versionado.
3. **Clasificar:** asignar una sola clase de riesgo a cada operación.
4. **Validar:** comprobar objetivos, precondiciones, permisos y contrato.
5. **Explicar:** mostrar efectos, límites y garantías de recuperación.
6. **Autorizar:** ligar el consentimiento a la huella exacta del plan.
7. **Preparar:** para `REVERSIBLE`, crear y verificar el material de compensación.
8. **Ejecutar:** aplicar únicamente lo autorizado y detenerse ante ambigüedad.
9. **Verificar:** comparar el resultado con las condiciones posteriores.
10. **Registrar:** emitir resultados y ledger declarativos.

## Mapa de datos

| Dato | Productor | Consumidor | Sensibilidad | Persistencia prevista |
|---|---|---|---|---|
| Observación | Adaptador de diagnóstico | Analizador/planificador | Puede incluir datos del equipo | Mínima y configurable |
| Hallazgo | Analizador | Planificador/UI | Media | Informe de sesión |
| Plan | Planificador | Autorizador/ejecutor | Alta: revela objetivos | Hasta cierre o retención definida |
| Token de confirmación | Autorizador | Ejecutor | Alta | Vida corta; no reutilizable |
| Respaldo | Preparador | Motor de compensación | Alta o crítica | Según política explícita |
| Entrada de ledger | Ejecutor | Auditoría/compensación | Alta | Según política y requisitos legales |
| Resultado | Ejecutor | UI/informe | Variable | Según política explícita |

## Mapa documental

```text
README.md
├─ PROJECTS.md       límites entre productos
├─ REQUIREMENTS.md   obligaciones verificables
├─ ARCHITECTURE.md   estructura y decisiones
│  ├─ COMPONENTS.md responsabilidades
│  ├─ CONTRACTS.md  formatos y garantías
│  └─ SITEMAP.md    estructura de interacción
├─ SECURITY.md       amenazas y controles
├─ TESTING.md        evidencia y puertas de calidad
├─ GOVERNANCE.md     autoridad y cambios
└─ CHANGELOG.md      hechos documentados
```

## Mapa de artefactos previsto

Esta es la estructura de directorios objetivo (`SPECIFIED`) para el proyecto, según la decisión `ADR-009`. La refactorización del prototipo actual a esta estructura está definida en el paquete de trabajo `WP-002`.

```text
Repairer_by_KLIK/
│
├── cmd/
│   └── repairer/
│       └── main.go
│
├── internal/
│   ├── app/          # Lógica de aplicación y casos de uso
│   ├── domain/       # Modelos de negocio (Plan, Operation, etc.)
│   ├── catalog/      # Catálogo de operaciones permitidas
│   ├── ledger/       # Lógica de escritura y lectura del ledger
│   ├── compensation/ # Lógica de respaldo y restauración
│   ├── platform/     # Adaptadores específicos del SO (Windows)
│   └── ui/           # Componentes de la interfaz de usuario (Fyne)
│
├── assets/           # Iconos, fuentes, etc.
│
├── evidence/         # Registros de compilación y pruebas
│
├── testdata/         # Datos para pruebas (fixtures)
│
├── go.mod
├── go.sum
├── .gitignore
│
└── README.md         # (y resto de la documentación)
```

La ubicación y los nombres son `PROPOSED`; todos los componentes deben implementarse en Go. El repositorio real será la autoridad para el mapa físico y la evidencia de cumplimiento.

## Mapa de confianza

```text
Entradas no confiables
  ├─ selección del usuario
  ├─ sistema de archivos y registro
  ├─ salida de herramientas del sistema
  ├─ planes o ledger importados
  └─ paquetes de actualización
           │
           ▼
Validación + normalización + autorización
           │
           ▼
Núcleo de ejecución con privilegio mínimo
           │
           ▼
Resultados saneados + auditoría verificable
```

Ningún archivo local se considera confiable solo por encontrarse en una carpeta creada por REPAIRER.
