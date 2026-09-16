# Contratos

## Principios

Los ejemplos de este documento son contratos de referencia `SPECIFIED`; no son evidencia de serializadores ni APIs implementadas.

- Los formatos son declarativos y versionados.
- Los consumidores rechazan versiones incompatibles y valores desconocidos.
- Las extensiones no pueden reducir la clase de riesgo.
- Ningún campo se evalúa como código.
- Tiempos en UTC; IDs opacos; enums estables e independientes del idioma.

## Contrato de clase de operación

---

## Contrato de Observación y Procedencia

Toda pieza de información recopilada se ajusta a un contrato que incluye su procedencia.

```json
{
  "schema_version": "1.0",
  "observation_id": "obs-cpu-temp-1663200000",
  "category": "HARDWARE_MONITOR",
  "name": "CPU_TEMPERATURE",
  "value": 65.5,
  "unit": "CELSIUS",
  "provenance": {
    "source": "WMI/MSAcpi_ThermalZoneTemperature",
    "method": "API_CALL",
    "timestamp": "2026-09-15T12:00:00Z",
    "target_ref": "device://cpu/0",
    "acquisition_status": "OBSERVED",
    "confidence": "HIGH"
  },
  "limitations": "La precisión depende del sensor de hardware y la implementación de ACPI del fabricante."
}
```

**Estados de Adquisición (`acquisition_status`):**
- `OBSERVED`: Leído de una fuente directa.
- `DERIVED`: Calculado a partir de otras observaciones.
- `ESTIMATED`: Proyectado a partir de un historial.
- `DECLARED`: Obtenido de una especificación.
- `UNKNOWN` / `UNSUPPORTED` / `ACCESS_DENIED` / `ERROR`: La obtención del dato falló.

---

| Clase | Cambia el objetivo | Compensación exigida | Consentimiento mínimo | Automatización por defecto |
|---|---:|---:|---|---|
| `READ_ONLY` | No | No aplica | Alcance de sesión | Permitida dentro del alcance |
| `REVERSIBLE` | Sí | Preparada y verificada antes | Confirmación del plan y respaldo | Solo mediante política explícita |
| `DESTRUCTIVE` | Sí, con posible pérdida | No se garantiza | Opt-in por lote y objetivos visibles | Prohibida |
| `IRREVERSIBLE` | Sí, sin rollback soportado | No aplica | Confirmación reforzada ligada al plan | Prohibida |

Reglas:

1. Solo se permite una clase por definición de operación.
2. Si una operación compuesta contiene varias clases, hereda la más restrictiva para autorización y presentación, sin ocultar las clases individuales.
3. Una implementación no puede reclasificar dinámicamente hacia menor riesgo.
4. `IRREVERSIBLE` no afirma imposibilidad forense de recuperar datos.

---

## Contrato de Dispositivo de Almacenamiento

```json
{
  "schema_version": "1.0",
  "device_id": "dev-nvme-ABC12345",
  "type": "STORAGE_DEVICE",
  "model": "Example NVMe SSD 1TB",
  "serial_number_ref": "obs-serial-ABC12345",
  "protocol": "NVME",
  "health_metrics": {
    "percentage_used": {
      "value": 15,
      "provenance_ref": "obs-nvme-health-1663200100"
    },
    "data_units_written": {
      "value": 30720000,
      "unit": "512_KB_UNITS",
      "provenance_ref": "obs-nvme-health-1663200100"
    },
    "tbw_consumed_derived": {
      "value": 15.0,
      "unit": "TERABYTES",
      "provenance_ref": "obs-tbw-derived-1663200101"
    }
  }
}
```

---

## Contrato de Hallazgo (Finding)

```json
{
  "schema_version": "1.0",
  "finding_id": "fnd-disk-reallocated-sectors-ABC12345",
  "category": "STORAGE_DEGRADATION",
  "severity": "HIGH",
  "target_ref": "dev-nvme-ABC12345",
  "evidence_refs": ["obs-smart-reallocated-sectors-1663200200"],
  "explanation": "El disco ha reasignado 5 sectores. Esto indica que algunas áreas de la superficie de almacenamiento han fallado y el firmware ha movido los datos a áreas de repuesto. Es una señal temprana de posible degradación del disco.",
  "recommendation_ref": "rec-backup-disk-ABC12345"
}
```

---

## Definición de operación

```json
{
  "schema_version": "1.0",
  "operation_id": "file.restore",
  "operation_version": "1",
  "risk_class": "REVERSIBLE",
  "parameter_schema_ref": "contract://file.restore/1/parameters",
  "required_privilege": "USER",
  "preconditions": ["TARGET_SCOPE_VALID", "BACKUP_READY"],
  "postconditions": ["TARGET_MATCHES_BACKUP"],
  "retry_policy": "EXPLICIT_REVALIDATION",
  "compensation_type": "RESTORE_PREVIOUS_VERSION"
}
```

Los valores son ilustrativos. `operation_id` debe resolver únicamente contra un catálogo instalado y aprobado; no contra una ruta o script entregado por el usuario.

## Plan de ejecución

```json
{
  "schema_version": "1.0",
  "plan_id": "018f-example-plan",
  "created_at": "2026-09-14T22:00:00Z",
  "expires_at": "2026-09-14T22:15:00Z",
  "operations": [
    {
      "instance_id": "op-001",
      "operation_id": "file.restore",
      "operation_version": "1",
      "risk_class": "REVERSIBLE",
      "target_ref": "target://local/example-01",
      "parameters": {
        "backup_ref": "backup://session-example/item-01"
      },
      "depends_on": []
    }
  ],
  "plan_digest": "sha256:EXAMPLE_NOT_A_REAL_DIGEST"
}
```

El digest se calcula sobre una representación canónica especificada por la implementación. Serializar JSON sin una regla canónica compartida no garantiza digests reproducibles.

## Autorización

```json
{
  "schema_version": "1.0",
  "authorization_id": "auth-example",
  "plan_id": "018f-example-plan",
  "plan_digest": "sha256:EXAMPLE_NOT_A_REAL_DIGEST",
  "maximum_risk_class": "REVERSIBLE",
  "issued_at": "2026-09-14T22:01:00Z",
  "expires_at": "2026-09-14T22:06:00Z",
  "nonce": "opaque-single-use-value",
  "confirmation_method": "INTERACTIVE_REVIEW"
}
```

El token o contenedor real debe protegerse contra manipulación y repetición. Este ejemplo no define criptografía ni confirma que exista.

## Resultado de operación

```json
{
  "schema_version": "1.0",
  "execution_id": "exec-example",
  "instance_id": "op-001",
  "started_at": "2026-09-14T22:02:00Z",
  "finished_at": "2026-09-14T22:02:02Z",
  "status": "SUCCEEDED_VERIFIED",
  "changed": true,
  "verification": {
    "status": "PASSED",
    "method": "TARGET_STATE_COMPARISON"
  },
  "error": null,
  "ledger_record_ids": ["record-example-0002"]
}
```

Estados mínimos: `SUCCEEDED_VERIFIED`, `SUCCEEDED_UNVERIFIED`, `FAILED_NO_CHANGE`, `FAILED_PARTIAL`, `CANCELLED`, `REJECTED` y `UNKNOWN`.

## Ledger declarativo

Una entrada registra un hecho consumado o un estado observado. No contiene instrucciones libres.

```json
{
  "schema_version": "1.0",
  "ledger_id": "ledger-example",
  "record_id": "record-example-0002",
  "sequence": 2,
  "recorded_at": "2026-09-14T22:02:02Z",
  "session_id": "session-example",
  "execution_id": "exec-example",
  "event_type": "OPERATION_COMPLETED",
  "operation": {
    "instance_id": "op-001",
    "operation_id": "file.restore",
    "operation_version": "1",
    "risk_class": "REVERSIBLE",
    "target_ref": "target://local/example-01"
  },
  "outcome": {
    "status": "SUCCEEDED_VERIFIED",
    "changed": true
  },
  "compensation": {
    "descriptor_type": "RESTORE_PREVIOUS_VERSION",
    "descriptor_version": "1",
    "backup_ref": "backup://session-example/item-previous",
    "target_ref": "target://local/example-01"
  },
  "previous_record_hash": "sha256:EXAMPLE_PREVIOUS",
  "record_hash": "sha256:EXAMPLE_CURRENT"
}
```

### Reglas del ledger

- `descriptor_type` pertenece a un enum cerrado.
- Sus parámetros siguen un esquema específico por versión.
- No existen campos `command`, `script`, `shell`, `expression` o equivalentes.
- Un descriptor desconocido es no ejecutable y produce rechazo seguro.
- La referencia de respaldo debe estar ligada a sesión, operación y objetivo.
- `previous_record_hash` puede aportar detección de alteraciones en cadena, pero no evita reescribir toda la cadena.
- La confianza requiere una referencia o ancla protegida fuera del control del atacante contemplado.

## Contrato de compensación

El motor acepta una solicitud como:

```json
{
  "schema_version": "1.0",
  "request_id": "comp-example",
  "source_record_id": "record-example-0002",
  "descriptor_type": "RESTORE_PREVIOUS_VERSION",
  "descriptor_version": "1",
  "backup_ref": "backup://session-example/item-previous",
  "target_ref": "target://local/example-01",
  "expected_current_state_ref": "state://exec-example/after"
}
```

Antes de restaurar, valida esquema, clase, identidad del respaldo, estado actual, permisos y autorización. No deriva comandos del contenido. El resultado usa los mismos estados estructurados que una operación normal.

## Compatibilidad

- Cambios incompatibles incrementan la versión mayor del esquema.
- Campos nuevos solo pueden ignorarse si el esquema los marca explícitamente como opcionales y seguros.
- Un productor no puede emitir una clase desconocida esperando que el consumidor la trate como `READ_ONLY`.
- La migración de ledger conserva el original, produce evidencia de transformación y nunca ejecuta descriptores durante la conversión.
