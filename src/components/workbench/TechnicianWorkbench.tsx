import React, { useState } from 'react';
import { RepairOrder, OrderStatus } from '../../types/repairer';
import { validateRepairOrder } from '../../utils/orderValidator';

interface TechnicianWorkbenchProps {
  initialOrder: RepairOrder;
  onSaveOrder: (updatedOrder: RepairOrder) => void;
}

// Se crea una lista de opciones para el select, desacoplando los datos de la vista.
// Esto facilita el mantenimiento y asegura la consistencia con el tipo OrderStatus.
const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'IN_PROGRESS', label: 'En Proceso' },
  { value: 'QUALITY_CHECK', label: 'Control de Calidad' },
  { value: 'COMPLETED', label: 'Completada' },
];

export const TechnicianWorkbench: React.FC<TechnicianWorkbenchProps> = ({
  initialOrder,
  onSaveOrder,
}) => {
  // Manejo de estado inmutable para la orden y los errores de validación
  const [order, setOrder] = useState<RepairOrder>(initialOrder);
  const [errors, setErrors] = useState<string[]>([]);

  // Cambio de estado de la orden
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    setOrder((prev) => ({ ...prev, status: newStatus }));
  };

  // Cambio de texto en las notas técnicas
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setOrder((prev) => ({ ...prev, technicianNotes: newNotes }));
  };

  // Procesar y validar formulario antes de guardar
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Invocar el validador puro de reglas de negocio
    const validation = validateRepairOrder(order);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Si todo es válido, limpiar errores y notificar al sistema
    setErrors([]);
    onSaveOrder(order); // La responsabilidad de notificar al usuario (con un toast, etc.) pasa al componente padre.
  };

  return (
    // Los estilos en línea se reemplazan por clases para mayor mantenibilidad.
    <div className="workbench-container">
      <h2>Mesa de Trabajo del Técnico</h2>
      <hr />

      {/* Renderizado condicional de la lista de errores de validación */}
      {errors.length > 0 && (
        <div className="error-box">
          <strong>No se pudo guardar la orden:</strong>
          <ul className="error-list">
            {errors.map((err) => (
              <li key={err}>{err}</li> // Usar el error como key es seguro si los mensajes son únicos.
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="orderId"><strong>ID de Orden:</strong></label>
          <input id="orderId" type="text" value={order.id} disabled className="input-field" />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="deviceId"><strong>Dispositivo:</strong></label>
          <input id="deviceId" type="text" value={order.deviceId} disabled className="input-field" />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="orderStatus"><strong>Estado de la Reparación:</strong></label>
          <select
            id="orderStatus"
            value={order.status}
            onChange={handleStatusChange}
            className="input-field"
          >
            {/* Las opciones se generan dinámicamente desde la lista `statusOptions` */}
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="technicianNotes"><strong>Notas Técnicas:</strong></label>
          <textarea id="technicianNotes" rows={5} value={order.technicianNotes || ''} onChange={handleNotesChange} placeholder="Escribe los detalles técnicos de la reparación..." className="input-field" />
        </div>

        <button type="submit" className="submit-button">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};
