import { RepairOrder } from '../types/repairer';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateRepairOrder(order: RepairOrder): ValidationResult {
  const errors: string[] = [];

  if (!order.id || order.id.trim() === '') {
    errors.push('El identificador de la orden es obligatorio.');
  }

  if (!order.deviceId || order.deviceId.trim() === '') {
    errors.push('El identificador del dispositivo es obligatorio.');
  }

  if (order.status === 'COMPLETED' && (!order.technicianNotes || order.technicianNotes.trim().length < 10)) {
    errors.push('Una orden completada requiere notas técnicas detalladas (mínimo 10 caracteres).');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}