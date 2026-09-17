// Importamos los tipos necesarios para la validación
import { RepairOrder } from '../types/repairer';

// Estructura que devolverá el validador
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida las reglas de negocio de una orden de reparación
 * antes de enviarla o cambiar su estado.
 */
export function validateRepairOrder(order: RepairOrder): ValidationResult {
  const errors: string[] = [];

  // 1. Verificar que el identificador de la orden exista
  if (!order.id || order.id.trim() === '') {
    errors.push('El identificador de la orden es obligatorio.');
  }

  // 2. Verificar que el dispositivo esté especificado
  if (!order.deviceId || order.deviceId.trim() === '') {
    errors.push('El identificador del dispositivo es obligatorio.');
  }

  // 3. Regla de negocio: Para marcar como completada, se requieren notas de al menos 10 caracteres
  if (order.status === 'COMPLETED' && (!order.technicianNotes || order.technicianNotes.trim().length < 10)) {
    errors.push('Una orden completada requiere notas técnicas detalladas (mínimo 10 caracteres).');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}