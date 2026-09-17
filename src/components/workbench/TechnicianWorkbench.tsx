import React, { useState } from 'react';
import { RepairOrder, OrderStatus } from '../../types/repairer';
import { validateRepairOrder } from '../../utils/orderValidator';

interface TechnicianWorkbenchProps {
  initialOrder: RepairOrder;
  onSaveOrder: (updatedOrder: RepairOrder) => void;
}

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
    onSaveOrder(order);
    alert('¡Orden validada y guardada con éxito!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Mesa de Trabajo del Técnico</h2>
      <hr />

      {/* Renderizado condicional de la lista de errores de validación */}
      {errors.length > 0 && (
        <div style={{ backgroundColor: '#ffe6e6', color: '#cc0000', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
          <strong>No se pudo guardar la orden:</strong>
          <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label><strong>ID de Orden:</strong></label>
          <input type="text" value={order.id} disabled style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label><strong>Dispositivo:</strong></label>
          <input type="text" value={order.deviceId} disabled style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="orderStatus"><strong>Estado de la Reparación:</strong></label>
          <select
            id="orderStatus"
            value={order.status}
            onChange={handleStatusChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="PENDING">Pendiente</option>
            <option value="IN_PROGRESS">En Proceso</option>
            <option value="QUALITY_CHECK">Control de Calidad</option>
            <option value="COMPLETED">Completada</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="technicianNotes"><strong>Notas Técnicas:</strong></label>
          <textarea
            id="technicianNotes"
            rows={5}
            value={order.technicianNotes || ''}
            onChange={handleNotesChange}
            placeholder="Escribe los detalles técnicos de la reparación..."
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};
