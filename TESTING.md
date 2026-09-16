# Estrategia de pruebas

## Estado

Esta política está `SPECIFIED`. No se recibieron suites, reportes ni entornos; la cobertura actual es `UNKNOWN`.

## Principios

1. Ninguna prueba destructiva se ejecuta contra recursos reales del usuario.
2. Los efectos se aíslan por prueba y se eliminan de forma segura al finalizar.
3. No se incorporan muestras de malware reales al repositorio.
4. Un mock prueba lógica; no demuestra integración con Windows ni recuperabilidad real.
5. Una capacidad no pasa a `VERIFIED` sin resultado reproducible y referencia a artefactos.
6. Las garantías publicadas nunca superan lo demostrado por la prueba.

## Niveles

### Unitarias

Validan clasificación, esquemas, normalización, políticas, máquinas de estado y redacción. No requieren privilegios ni recursos del host.

### Integración aislada

Validan adaptadores y persistencia en directorios temporales, cuentas limitadas, almacenes efímeros o servicios simulados con contratos fieles.

### Sistema

Validan el producto empaquetado sobre versiones de Windows declaradas, primero con usuario estándar y después con elevación controlada donde corresponda.

### Destructive Sandbox

Validan `DESTRUCTIVE` e `IRREVERSIBLE` exclusivamente en máquinas virtuales descartables, discos virtuales o dispositivos de laboratorio designados. Requieren inventario de objetivos, aprobación, snapshot cuando aplique y prohibición técnica de alcanzar recursos fuera del entorno.

Las pruebas sobre un SSD de laboratorio pueden verificar la solicitud y el comportamiento observable, pero no deben concluir borrado físico garantizado de un archivo a partir de sobrescritura lógica.

## Matriz obligatoria por clase

| Control | READ_ONLY | REVERSIBLE | DESTRUCTIVE | IRREVERSIBLE |
|---|---:|---:|---:|---:|
| Verificar ausencia de mutación | Sí | No aplica | No aplica | No aplica |
| Revisar plan antes de ejecutar | Sí | Sí | Sí | Sí |
| Preparar respaldo | No | Sí | No, salvo copia informativa | No |
| Probar compensación | No | Sí | No | No |
| Confirmación explícita | Sesión | Plan | Reforzada | Reforzada y específica |
| Sandbox descartable | Recomendado | Obligatorio en integración | Obligatorio | Obligatorio |
| Automatización desatendida por defecto | Limitada | No | No | No |
| Revisión manual de texto de garantía | Sí | Sí | Sí | Sí |

## Casos mínimos

### Catálogo y planificación

- operación sin clase, con clase desconocida o más de una clase;
- duplicación de ID o versión incompatible;
- dependencia circular, ausente o bloqueada;
- mutación del plan después de autorizar;
- operación compuesta cuya clase efectiva no sea la más restrictiva;
- parámetros adicionales, tipos incorrectos y límites excedidos.

### Diagnóstico y Procedencia

- Consulta a una API de Windows que falla, es denegada o devuelve datos corruptos.
- Conversión de unidades (ej. bytes a TB) con valores límite.
- Generación de un hallazgo a partir de observaciones simuladas.
- Generación de una recomendación a partir de un hallazgo.
- Casos donde la ausencia de un dato (ej. temperatura de CPU) se maneja como `UNKNOWN` y no como `0`.
- Pruebas de estimación (ej. desgaste de disco) con datos insuficientes o no lineales.

### Salud de Almacenamiento

- Parsing de datos SMART/NVMe simulados con valores críticos (sectores reasignados, etc.).
- Cálculo de TBW a partir de unidades de datos escritas.

### Rutas y objetivos

- rutas relativas, traversal, caracteres especiales y formatos largos;
- enlaces, junctions, puntos de reanálisis y sustitución entre validación y uso;
- diferencias de mayúsculas, normalización Unicode y localización;
- recursos de red, removibles o fuera del alcance autorizado;
- objetivo que desaparece o cambia durante la operación.

### Privilegios

- usuario estándar, acceso denegado y elevación cancelada;
- solicitud de privilegios mayor que la declarada;
- intento de ampliar objetivos a través del canal elevado;
- caída y reinicio del componente privilegiado;
- ausencia de secretos en errores y logs.

### Ledger y compensación

- JSON truncado, duplicado, demasiado grande o con campos desconocidos;
- descriptor desconocido o versión incompatible;
- campos que intentan introducir comandos o expresiones;
- secuencia rota, hash incorrecto y sustitución completa de cadena;
- respaldo ausente, corrupto, ajeno a la sesión o con permisos incorrectos;
- cambio legítimo posterior que impide restaurar sin sobrescribir;
- compensación repetida y fallo parcial.

### Consentimiento

- token expirado, reutilizado o emitido para otro plan;
- objetivos o parámetros modificados;
- confirmación premarcada o ambigua;
- cancelación antes y durante una secuencia;
- ejecución desatendida de clases prohibidas.

### Informes y privacidad

- secretos, tokens, contenido privado y rutas innecesarias redactados;
- distinción entre no soportado, inaccesible, ausente y error;
- estado parcial no resumido como éxito;
- textos sin promesa de inmutabilidad o borrado físico no demostrable.

## Pruebas de compensación

Por cada operación `REVERSIBLE` se requiere:

1. prueba del estado inicial;
2. creación y validación del respaldo;
3. mutación confirmada;
4. restauración con verificación semántica, no solo código de salida;
5. segundo intento para validar idempotencia o rechazo seguro;
6. fallo inducido en cada etapa;
7. cambio concurrente del objetivo;
8. prueba de retención y permisos del respaldo.

El orden inverso de una secuencia se prueba con dependencias reales. No basta invertir un arreglo para declarar rollback LIFO correcto.

## Datos de prueba

- Usar archivos benignos generados para la prueba y árboles temporales.
- Para parsers de formatos, usar fixtures mínimos, legalmente redistribuibles y documentados.
- Para escenarios de seguridad, usar cadenas inertes y archivos no ejecutables.
- Muestras reales sospechosas requieren un programa de laboratorio separado y quedan fuera de este baseline.

## Evidencia

Cada ejecución aceptada conserva:

- commit o identidad exacta del artefacto;
- versión del contrato y suite;
- sistema operativo, arquitectura y configuración relevante;
- ID de entorno aislado;
- tiempo UTC;
- resultado por caso y logs saneados;
- artefactos de cobertura cuando correspondan;
- desviaciones y aprobación.

## Puertas de entrega

- [ ] Requisitos trazados a pruebas.
- [ ] Cero fallos críticos o altos sin decisión de aceptación de riesgo.
- [ ] Operaciones mutantes probadas en entorno aislado.
- [ ] Restauración verificada para cada operación `REVERSIBLE`.
- [ ] Confirmaciones y límites de automatización probados.
- [ ] Instalación, actualización y desinstalación verificadas.
- [ ] Matriz de compatibilidad sustentada por resultados.
- [ ] Revisión de seguridad y privacidad cerrada.
- [ ] Documentación coherente con las capacidades demostradas.
- [ ] Paquete compuesto por binarios y componentes Go, sin dependencia operativa de C#, .NET o PowerShell.
