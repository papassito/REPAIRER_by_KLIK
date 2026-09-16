# Seguridad

## Estado y alcance

Este documento define controles `SPECIFIED`. No certifica que estén implementados. REPAIRER by KLIK opera conceptualmente sobre recursos sensibles del sistema; por ello, cualquier implementación debe asumir que una clasificación incorrecta, una ruta manipulada o una elevación excesiva puede causar pérdida de datos o comprometer el equipo.

## Objetivos de seguridad

1. Evitar cambios no autorizados o fuera del plan visible.
2. Reducir el privilegio y el tiempo de exposición de componentes elevados.
3. Impedir que entradas, planes, logs o ledger se conviertan en código ejecutable.
4. Conservar trazabilidad suficiente sin recopilar datos innecesarios.
5. Detectar alteraciones de registros bajo supuestos documentados.
6. Evitar que un fallo se presente como mantenimiento exitoso.
7. Mantener honestidad sobre rollback, eliminación y compatibilidad.

## Activos protegidos

- archivos, configuraciones y metadatos del usuario;
- configuración del sistema operativo;
- credenciales, tokens y secretos accesibles al proceso;
- respaldos de compensación;
- planes autorizados y tokens de consentimiento;
- ledger, informes y evidencia de prueba;
- paquetes de instalación, actualización y dependencias;
- historial de observaciones y tendencias;
- números de serie de hardware;
- identidad y reputación del producto.

## Actores y amenazas

| Amenaza | Ejemplo | Control mínimo |
|---|---|---|
| Entrada maliciosa | Ruta con traversal, enlace o sustitución durante la operación | Normalización, acceso seguro al objeto y revalidación inmediata. |
| Inferencia incorrecta | Un error de WMI se interpreta como un disco saludable | Modelo de procedencia estricto (`OBSERVED`, `ERROR`, etc.) y no convertir errores en estados `OK`. |
| Inyección | Texto de un plan o ledger interpretado por shell | Catálogo cerrado, argumentos tipados y prohibición de evaluación. |
| Escalada excesiva | Toda la interfaz se ejecuta como administrador | Separación de proceso y elevación por operación. |
| Confusión de intención | Un diagnóstico activa limpieza | Separación de plan, consentimiento y ejecución. |
| Sustitución de respaldo | El material de compensación apunta a otro objetivo | Identidad fuerte, permisos, metadatos y verificación de correspondencia. |
| Manipulación de ledger | Borrar y recalcular hashes locales | Ancla confiable independiente o firma si el modelo de riesgo lo requiere. |
| Fuga de información | Logs incluyen secretos o contenido privado | Minimización, redacción, permisos y retención. |
| Paquete comprometido | Actualización o dependencia modificada | Procedencia, firma, inventario y verificación antes de ejecutar. |
| Denegación de servicio | Una consulta de diagnóstico intensiva degrada el sistema | Las operaciones de observación deben ser eficientes y, si es necesario, ejecutarse con menor prioridad. |
| Repetición | Reuso de una autorización antigua | Nonce, expiración y vínculo con la huella del plan. |

## Fronteras de confianza

Se consideran no confiables:

- entradas del usuario y archivos importados;
- rutas y nombres provenientes del sistema de archivos;
- salida de utilidades del sistema y proveedores externos;
- contenido de logs, reportes y ledger;
- parámetros recibidos por cualquier interfaz;
- medios extraíbles, recursos de red y paquetes descargados.

Cruzar una frontera requiere validación de esquema, normalización, límites de tamaño, comprobación de autorización y manejo explícito de errores.

## Privilegios

- La observación se realiza con el menor privilegio posible.
- La elevación debe estar aislada de la presentación y limitada a una operación validada.
- Un proceso elevado no acepta comandos arbitrarios, rutas sin normalizar ni descriptores desconocidos.
- El usuario debe conocer por qué se solicita elevación y qué objetivos abarca.
- Las credenciales o tokens de elevación no se escriben en logs ni ledger.
- Después de ejecutar, el contexto elevado debe terminar o reducir sus capacidades.

## Seguridad del ledger

El ledger es un registro de datos, no un script.

Debe:

- usar un esquema cerrado y versionado;
- aceptar únicamente tipos de operación y compensación enumerados;
- referenciar respaldos mediante identificadores opacos;
- aplicar límites de tamaño, longitud y cardinalidad;
- rechazar campos desconocidos salvo una política de extensión explícita;
- separar datos del mecanismo que los ejecuta;
- protegerse con permisos restrictivos y retención definida;
- registrar integridad sin describir el resultado como inmutable.

No debe contener:

- comandos de shell, intérprete o sistema almacenados como texto ejecutable;
- plantillas que se evalúen como código;
- credenciales o secretos;
- contenido completo de archivos salvo necesidad aprobada;
- rutas sensibles cuando una referencia opaca sea suficiente.

SHA-256 puede demostrar que un contenido coincide con una huella confiable. Un atacante capaz de reemplazar el ledger y su huella puede eludir una comprobación local simple. Si se necesita resistencia a ese atacante, deberá aprobarse un mecanismo adicional —por ejemplo, firma autenticada o anclaje independiente— y documentar sus claves, disponibilidad y recuperación.

## Seguridad de respaldos y compensación

- El respaldo se crea y verifica antes de una mutación `REVERSIBLE`.
- Debe existir espacio suficiente y una política ante agotamiento.
- El acceso se limita al usuario o servicio autorizado.
- El cifrado en reposo se decide según sensibilidad y modelo de amenaza; no se asume implementado.
- La restauración verifica identidad, procedencia, tamaño y digest cuando aplique.
- La retención y eliminación son visibles para el usuario.
- Un respaldo sin prueba de restauración no justifica anunciar rollback garantizado.

## Operaciones destructivas

- `DESTRUCTIVE` e `IRREVERSIBLE` requieren opt-in y objetivos enumerados.
- No se incluyen en selecciones por defecto ni mantenimiento automático.
- No aceptan compensaciones ficticias.
- `IRREVERSIBLE` describe la falta de recuperación soportada por el producto.
- En SSD, la sobrescritura a nivel de archivo no permite prometer eliminación física garantizada debido al comportamiento interno del dispositivo. La interfaz debe decir exactamente qué solicitud realizó y qué pudo verificar.
- La sanitización de un dispositivo completo, si se diseña, será una capacidad separada con compatibilidad, autorización y pruebas específicas.

## Registro y privacidad

Todo campo registrado debe responder a un propósito operativo o de seguridad. Por defecto:

- usar IDs de correlación en lugar de datos personales;
- redactar tokens, claves y contenido sensible;
- limitar rutas a lo necesario para explicar el objetivo;
- no registrar contenido de documentos;
- definir retención y eliminación;
- permitir exportación saneada para soporte;
- registrar acceso o modificación del material de auditoría cuando el diseño lo permita.

## Actualizaciones y cadena de suministro

Antes de habilitar actualizaciones se requieren:

1. canal autenticado;
2. manifiesto firmado o autenticado;
3. protección contra downgrade no autorizado;
4. verificación antes de ejecución;
5. inventario de componentes y licencias;
6. respuesta a vulnerabilidades y capacidad de revocación;
7. prueba de instalación, fallo y recuperación.

Nada de lo anterior se considera implementado.

## Reporte de vulnerabilidades

El canal de reporte, tiempos de respuesta y política de divulgación están `UNKNOWN`. Deben definirse antes de una distribución pública. Hasta entonces, no se debe inventar una dirección de seguridad ni prometer un SLA.

## Lista de salida para producción

- [ ] Modelo de amenazas revisado contra la implementación real.
- [ ] Catálogo completo de operaciones y clases aprobado.
- [ ] Pruebas de inyección, rutas, enlaces y condiciones de carrera superadas.
- [ ] Separación de privilegios verificada.
- [ ] Ledger y respaldos protegidos y probados.
- [ ] Textos de riesgo y borrado revisados.
- [ ] Procedencia, firma e inventario de dependencias disponibles.
- [ ] Canal de vulnerabilidades definido.
