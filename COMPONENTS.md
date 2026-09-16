# Componentes lógicos

## Estado

Los componentes de este documento están `SPECIFIED` como responsabilidades arquitectónicas. Todos deben implementarse en Go, sin motores auxiliares en otros lenguajes. Esto no prueba la existencia de paquetes, procesos o ejecutables; el framework gráfico y las APIs concretas de Windows siguen sin verificarse.

## Catálogo

### 1. Adaptadores de observación

**Responsabilidad:** consultar fuentes del sistema (WMI, APIs de Windows, etc.) y producir `Observaciones` tipadas, cada una con su procedencia.

**Sub-componentes lógicos:**
- **Adaptador de Inventario:** Recopila información de sistema, CPU, memoria, placa base.
- **Adaptador de Almacenamiento:** Enumera discos y lee atributos SMART/NVMe.
- **Adaptador de Red:** Observa interfaces, IPs y estado de conectividad.
- **Adaptador de Sockets:** Enumera puertos y procesos asociados.
- **Adaptador de Salud de Windows:** Consulta servicios, drivers y eventos.
- **Adaptador de Rendimiento:** Toma muestras de uso de CPU/memoria.

**Reglas:**
- Son `READ_ONLY` por definición.
- No deben convertir salida localizada o texto libre en autoridad sin validación.
- No deben solicitar elevación global para consultas que no la requieran.

### 2. Normalizador y analizador

**Responsabilidad:** validar observaciones, normalizar unidades y producir hallazgos con procedencia.

**Sub-componentes lógicos:**
- **Motor de Hallazgos (`Findings Engine`):** Aplica reglas a las observaciones para generar `Hallazgos` (ej. "si `Reallocated_Sector_Ct > 0` entonces generar `FINDING_DISK_DEGRADATION`").
- **Motor de Recomendaciones (`Recommendation Engine`):** Convierte `Hallazgos` en `Recomendaciones` de acción para el usuario.

**Reglas:**
- No ejecutan acciones correctivas.
- Un hallazgo o recomendación no es una orden de ejecución.
- Conservan la trazabilidad hacia las observaciones que los originaron.

### 3. Catálogo de operaciones

**Responsabilidad:** definir operaciones permitidas mediante contratos versionados.

Cada entrada contiene ID, versión, clase, parámetros tipados, privilegios, precondiciones, efectos, política de reintento y esquema de resultado. No admite operaciones dinámicas aportadas por el ledger.

### 4. Planificador

**Responsabilidad:** construir planes inertes a partir de hallazgos y selección explícita.

- Calcula una huella del plan.
- Resuelve dependencias y conflictos.
- No puede degradar una clase de riesgo declarada por el catálogo.
- No ejecuta el plan ni inserta comandos ejecutables.

### 5. Validador de política

**Responsabilidad:** aplicar reglas de alcance, riesgo, consentimiento, compatibilidad y privilegio.

- Falla de forma cerrada ante datos incompletos.
- Emite razones estructuradas y aptas para presentación.
- Se evalúa de nuevo inmediatamente antes de ejecutar.

### 6. Gestor de consentimiento

**Responsabilidad:** vincular una autorización humana al plan exacto.

- Los tokens son de vida corta, de un solo propósito y no contienen secretos reutilizables.
- Un cambio de plan invalida la autorización.
- El nivel de confirmación depende de la clase más alta incluida.

### 7. Preparador de compensación

**Responsabilidad:** crear, proteger y verificar el estado necesario para revertir operaciones `REVERSIBLE`.

- Debe finalizar antes de la mutación.
- No crea falsas expectativas para acciones destructivas.
- Registra referencias a respaldos; evita duplicar contenido sensible en el ledger.

### 8. Ejecutor controlado

**Responsabilidad:** ejecutar únicamente operaciones del catálogo y parámetros validados.

- No evalúa texto como código.
- Aplica mínimo privilegio y límites de tiempo.
- Verifica precondiciones de último momento.
- Produce resultados por operación y detiene dependencias cuando corresponde.

### 9. Motor de compensación

**Responsabilidad:** interpretar descriptores declarativos permitidos y restaurar estado cuando el contrato lo admite.

- Solo acepta tipos conocidos y versionados.
- No ejecuta comandos almacenados.
- Verifica que el respaldo corresponda al objetivo y a la sesión.
- Informa estado restaurado, parcial, fallido o indeterminado.

### 10. Ledger de auditoría

**Responsabilidad:** conservar hechos estructurados de planificación, autorización, ejecución y compensación.

- El contenido es declarativo y validado por esquema.
- Los hashes sirven para verificación de integridad, no convierten el archivo en inmutable.
- Una cadena de hashes detecta cambios solo bajo sus supuestos y con un ancla confiable externa.
- La firma, almacenamiento append-only o servicio remoto son decisiones futuras, no capacidades asumidas.

### 11. Presentación

**Responsabilidad:** exponer planes, riesgos, consentimientos, progreso y resultados sin alterar la semántica del núcleo.

- No redefine clases ni garantías.
- No presenta un fallo o estado desconocido como éxito.
- Aplica las rutas descritas en `SITEMAP.md` mediante una implementación Go; el framework no puede introducir otro runtime obligatorio.

### 12. Generador de informes

**Responsabilidad:** producir resúmenes legibles y exportaciones redactadas.

- Distingue observación, inferencia, acción y resultado.
- Incluye versión de contrato e IDs de correlación.
- Elimina secretos y minimiza datos personales.

## Dependencias permitidas

```text
Observación -> Normalización -> Planificación -> Política/Consentimiento -> Ejecución
                                      │                         │
                                      └-> Preparación ----------┤
                                                                ├-> Ledger
                                                                └-> Resultado/Informe

Ledger + Catálogo + Respaldos -> Motor de compensación -> Resultado/Informe
```

La presentación puede invocar casos de uso, pero no debe saltar directamente a primitivas del sistema. El ledger nunca es una fuente de código ejecutable.

## Criterios para dividir o combinar componentes

Los límites pueden implementarse en uno o varios procesos compilados desde Go. La decisión debe preservar:

- contratos testeables;
- separación entre plan y ejecución;
- control de privilegios;
- imposibilidad de ejecutar datos del ledger;
- trazabilidad por operación;
- aislamiento de fallos acorde con el riesgo.
