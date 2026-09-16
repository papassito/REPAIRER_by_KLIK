# Mapa de navegación

## Estado

Esta es una arquitectura de información `SPECIFIED` para una interfaz futura implementada en Go. No confirma que exista GUI, aplicación web o CLI, ni selecciona todavía un framework de presentación.

## Estructura propuesta

```text
Inicio
├─ Estado de sesión
├─ Diagnóstico
│  ├─ Seleccionar alcance
│  ├─ Ejecutar observación
│  ├─ Hallazgos
│  └─ Exportar informe
├─ Plan de mantenimiento
│  ├─ Operaciones propuestas
│  ├─ Clase y riesgo
│  ├─ Objetivos y efectos
│  ├─ Precondiciones y permisos
│  └─ Revisar autorización
├─ Ejecución
│  ├─ Progreso por operación
│  ├─ Eventos y advertencias
│  ├─ Cancelación segura
│  └─ Resultado
├─ Recuperación
│  ├─ Sesiones reversibles
│  ├─ Material de respaldo
│  ├─ Vista previa de compensación
│  └─ Resultado de restauración
├─ Historial y auditoría
│  ├─ Sesiones
│  ├─ Entradas de ledger
│  ├─ Verificación de integridad
│  └─ Exportación redactada
├─ Configuración
│  ├─ Privacidad y retención
│  ├─ Rutas y límites
│  ├─ Actualizaciones
│  └─ Accesibilidad
└─ Acerca de
   ├─ Versión y procedencia
   ├─ Compatibilidad verificada
   ├─ Licencias
   └─ Límites y soporte
```

## Reglas de navegación por riesgo

- `READ_ONLY`: puede iniciarse desde Diagnóstico después de mostrar alcance y permisos.
- `REVERSIBLE`: pasa obligatoriamente por revisión del plan y confirmación del respaldo.
- `DESTRUCTIVE`: no puede ejecutarse desde una acción rápida; requiere pantalla dedicada, objetivos enumerados y opt-in.
- `IRREVERSIBLE`: usa un flujo aislado, confirmación reforzada ligada al plan y un último punto de cancelación anterior a la mutación.
- Ninguna confirmación puede estar premarcada.
- Un cambio en objetivos, clase, parámetros o versión invalida la confirmación anterior.

## Contenido mínimo de una ficha de operación

1. nombre comprensible e ID técnico;
2. clase de operación;
3. objetivo exacto y límites;
4. efecto esperado;
5. permisos requeridos;
6. condiciones previas y posteriores;
7. garantía real de recuperación;
8. material que se conservará y su retención;
9. riesgos y fallos conocidos;
10. referencia al resultado y a la auditoría.

## Estados de interfaz

La presentación debe distinguir visual y semánticamente:

- pendiente de análisis;
- listo para revisión;
- requiere elevación;
- requiere consentimiento;
- en preparación;
- en ejecución;
- cancelado antes de cambios;
- éxito verificado;
- éxito no verificable;
- fallo sin cambios;
- fallo con estado parcial;
- compensación disponible;
- compensación fallida;
- no soportado.

“Terminado” no debe usarse como sustituto de un resultado verificable.

## Accesibilidad y seguridad de presentación

- No depender solo de color para comunicar riesgo.
- Mantener etiquetas de texto para las cuatro clases.
- Mostrar rutas extensas de forma inspeccionable sin ocultar el objetivo real.
- Permitir copiar un ID de correlación sin exponer secretos.
- No renderizar contenido de logs como HTML o marcado confiable.
- Evitar lenguaje de presión o certeza absoluta en confirmaciones.
- Mantener disponible el alcance autorizado durante la ejecución.

## Interfaz de línea de comandos

Si se incorpora una CLI, debe estar escrita en Go y preservar las mismas puertas de seguridad. Los indicadores de automatización no pueden eludir la prohibición de ejecución desatendida para `IRREVERSIBLE` salvo una decisión de gobierno específica, un mecanismo de autorización equivalente y pruebas dedicadas.
