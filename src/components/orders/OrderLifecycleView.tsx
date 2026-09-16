import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Camera, 
  FileText, 
  CheckSquare, 
  Wrench, 
  Boxes, 
  CheckCircle2, 
  DollarSign, 
  ShieldAlert, 
  Cpu, 
  User, 
  Smartphone, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Play,
  Share2,
  FileCheck,
  Hash
} from 'lucide-react';
import { useRepairer } from '../../context/RepairerContext';
import { RepairOrderStatus, EvidenceAngle, QCItem, ADB_ALLOWLIST } from '../../types/repairer';

interface OrderLifecycleViewProps {
  onBack: () => void;
  onOpenWorkbench: () => void;
  onOpenCustomerPortal: () => void;
}

export const OrderLifecycleView: React.FC<OrderLifecycleViewProps> = ({ 
  onBack, 
  onOpenWorkbench,
  onOpenCustomerPortal
}) => {
  const { 
    selectedOrder, 
    updateOrderStatus, 
    addEvidence, 
    runDiagnosticSession, 
    createEstimateVersion,
    approveEstimate,
    addWorkLogEntry,
    consumePartForOrder,
    parts,
    completeQualityControl,
    finalizeDeliveryAndPayment,
    currentUser,
    auditLogs
  } = useRepairer();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'evidence' | 'checkin' | 'diagnostic' | 'estimate' | 'workbench' | 'parts' | 'qc' | 'delivery' | 'audit'
  >('overview');

  // Evidence upload modal state
  const [newEvidenceAngle, setNewEvidenceAngle] = useState<EvidenceAngle>('front');
  const [newEvidenceUrl, setNewEvidenceUrl] = useState('');
  const [newEvidenceNotes, setNewEvidenceNotes] = useState('');
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);

  // New Work log entry state
  const [workLogAction, setWorkLogAction] = useState('');
  const [workLogCategory, setWorkLogCategory] = useState<any>('REPAIR');
  const [workLogNotes, setWorkLogNotes] = useState('');

  // Estimate state
  const [newPartId, setNewPartId] = useState(parts[0]?.id || '');
  const [laborAmount, setLaborAmount] = useState(35);

  // Delivery & Payment state
  const [paymentAmount, setPaymentAmount] = useState(81.20);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CARD');
  const [receiverName, setReceiverName] = useState(selectedOrder?.customerName || '');
  const [receiverDni, setReceiverDni] = useState('INE 2910481920');

  if (!selectedOrder) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No hay ninguna orden seleccionada.</p>
        <button 
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  // Lifecycle ordered sequence for the visual state progress
  const LIFECYCLE_STEPS: Array<{ key: RepairOrderStatus; label: string }> = [
    { key: 'RECEIVED', label: 'DRAFT' },
    { key: 'INSPECTION', label: 'VALIDATED' },
    { key: 'DIAGNOSING', label: 'AUTHORIZED' },
    { key: 'ESTIMATE_PENDING', label: 'PREPARING' },
    { key: 'APPROVED', label: 'READY' },
    { key: 'IN_REPAIR', label: 'RUNNING' },
    { key: 'QUALITY_CONTROL', label: 'Control QC' },
    { key: 'READY_FOR_PICKUP', label: 'Listo' },
    { key: 'DELIVERED', label: 'Entregado' },
    { key: 'CLOSED', label: 'Cerrado' }
  ];

  const currentStepIndex = LIFECYCLE_STEPS.findIndex(s => s.key === selectedOrder.status);

  // Order-specific audit logs
  const orderAuditLogs = auditLogs.filter(a => a.repairOrderId === selectedOrder.id);

  const handleAddEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceUrl) return;
    addEvidence(selectedOrder.id, newEvidenceAngle, newEvidenceUrl, newEvidenceNotes);
    setNewEvidenceUrl('');
    setNewEvidenceNotes('');
    setShowEvidenceForm(false);
  };

  const handleAddWorkLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workLogAction) return;
    addWorkLogEntry(selectedOrder.id, {
      category: workLogCategory,
      action: workLogAction,
      notes: workLogNotes
    });
    setWorkLogAction('');
    setWorkLogNotes('');
  };

  const handleQuickDiagnostic = async () => {
    await runDiagnosticSession(selectedOrder.id, 'ADB');
  };

  const handleCreateEstimate = () => {
    const selectedPart = parts.find(p => p.id === newPartId);
    const items: any[] = [
      {
        id: `ei_${Date.now()}_labor`,
        type: 'LABOR',
        description: 'Mano de obra especializada de reemplazo y microelectrónica',
        quantity: 1,
        unitCost: 0,
        unitPrice: laborAmount,
        total: laborAmount
      }
    ];

    if (selectedPart) {
      items.push({
        id: `ei_${Date.now()}_part`,
        type: 'PART',
        description: selectedPart.name,
        partId: selectedPart.id,
        partSku: selectedPart.sku,
        quantity: 1,
        unitCost: selectedPart.cost,
        unitPrice: selectedPart.salePrice,
        total: selectedPart.salePrice
      });
    }

    createEstimateVersion(selectedOrder.id, items, 'Presupuesto formal emitido tras diagnóstico');
  };

  const handleQuickApprove = () => {
    if (selectedOrder.estimates.length > 0) {
      const latest = selectedOrder.estimates[0];
      approveEstimate(
        selectedOrder.id, 
        latest.id, 
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><path d="M10 25 Q 40 5 80 30 T 110 15" stroke="white" stroke-width="2" fill="none"/></svg>',
        selectedOrder.customerName
      );
    }
  };

  const handleQuickPassQC = () => {
    const qcList: QCItem[] = [
      { id: 'qc_1', name: 'Función de Carga Rápida / Entrada Amperaje', status: 'PASS', notes: 'Detecta 9V 2.2A estables' },
      { id: 'qc_2', name: 'Puerto USB-C transmisión de datos ADB', status: 'PASS' },
      { id: 'qc_3', name: 'Pantalla y Digitalizador Touch', status: 'PASS' },
      { id: 'qc_4', name: 'Cámaras y Micrófonos', status: 'PASS' },
      { id: 'qc_5', name: 'Sellado Térmico y Cierre Cosmético', status: 'PASS' }
    ];

    completeQualityControl(selectedOrder.id, true, qcList, {
      initialSymptom: selectedOrder.intakeReason,
      initialFaultConfirmed: 'Falla confirmada en puerto de carga y sub-placa',
      repairedSolution: 'Instalación de Sub-placa OEM y Flex interconexión',
      postRepairValidation: 'Prueba de 100% de subsistemas PASS'
    }, 'QC certificado conforme a especificaciones.');
  };

  const handleDeliveryAndClose = () => {
    finalizeDeliveryAndPayment(selectedOrder.id, {
      amount: paymentAmount,
      method: paymentMethod,
      invoice: true
    }, {
      receiverName,
      receiverDni,
      signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30"><path d="M5 20 Q 50 5 95 20" stroke="white" stroke-width="2" fill="none"/></svg>',
      checklistConfirmed: true
    }, 90);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Volver al listado"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                {selectedOrder.orderNumber}
              </span>
              <h1 className="text-lg md:text-xl font-bold text-white font-display">
                {selectedOrder.deviceSummary}
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {selectedOrder.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cliente: <span className="text-slate-200 font-semibold">{selectedOrder.customerName}</span> • Tel: <span className="text-slate-300 font-mono">{selectedOrder.customerPhone}</span> • Técnico: <span className="text-slate-300">{selectedOrder.assignedTechnicianName || 'No asignado'}</span>
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenCustomerPortal}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Portal del Cliente
          </button>
          <button
            onClick={onOpenWorkbench}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            Abrir en Workbench
          </button>
        </div>
      </div>

      {/* 22. MOTOR DE ESTADOS: Interactive Lifecycle Progression Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Eje Central: Ciclo de Vida de la Reparación
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Fase actual: <strong className="text-white">{selectedOrder.status}</strong>
          </span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-1 min-w-[700px]">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = currentStepIndex >= idx;
              const isCurrent = selectedOrder.status === step.key;
              return (
                <div key={step.key} className="flex-1 flex items-center">
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, step.key, `Transición manual a ${step.label}`)}
                    className={`w-full py-1.5 px-2 rounded text-center text-[10px] font-mono font-semibold transition-all cursor-pointer border ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                        : isPast
                          ? 'bg-cyan-950/40 text-cyan-400 border-cyan-800/60'
                          : 'bg-slate-800/40 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {step.label}
                  </button>
                  {idx < LIFECYCLE_STEPS.length - 1 && (
                    <div className={`w-2 h-0.5 shrink-0 ${isPast ? 'bg-cyan-700' : 'bg-slate-800'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Deep Entities */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Plan & Trazabilidad', icon: FileText },
          { id: 'evidence', label: `Evidencias (${selectedOrder.evidence.length})`, icon: Camera },
          { id: 'checkin', label: 'Integridad Inicial', icon: CheckSquare },
          { id: 'diagnostic', label: `Diagnóstico & Windows API (${selectedOrder.diagnosticSessions.length})`, icon: Cpu },
          { id: 'estimate', label: `Operaciones de Mantenimiento (${selectedOrder.estimates.length})`, icon: DollarSign },
          { id: 'workbench', label: `Work Log (${selectedOrder.workLogs.length})`, icon: Wrench },
          { id: 'parts', label: `Refacciones (${selectedOrder.partsConsumed.length})`, icon: Boxes },
          { id: 'qc', label: 'Control Calidad (QC)', icon: CheckCircle2 },
          { id: 'delivery', label: 'Entrega & Garantía', icon: ShieldCheck },
          { id: 'audit', label: `Auditoría (${orderAuditLogs.length})`, icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: OVERVIEW & TIMELINE */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                Motivo de la sesión de mantenimiento y diagnóstico
              </h3>
              <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  SÍNTOMA DE SISTEMA DETECTADO
                </span>
                <p className="text-sm font-semibold text-white mt-0.5">
                  "{selectedOrder.intakeReason}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-mono text-[11px] block">Observaciones Iniciales:</span>
                  <p className="text-slate-200 mt-1">{selectedOrder.physicalCondition || 'Sin observaciones'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[11px] block">Logs / Respaldos Disponibles:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedOrder.receivedAccessories.length > 0 ? (
                      selectedOrder.receivedAccessories.map((acc, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[10px]">
                          {acc}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500">Ninguno</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Status History (Section 3: Traceability Principle) */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Principio de Trazabilidad: Historial de Eventos
              </h3>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {selectedOrder.statusHistory.map((hist, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-slate-900" />
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {hist.status}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(hist.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {hist.comment || 'Cambio registrado en el sistema'}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Por: {hist.changedBy}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer & Technical Card */}
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Host Target / Administrador
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Nombre:</span>
                  <p className="font-semibold text-white">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Teléfono:</span>
                  <p className="font-mono text-slate-200">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Correo:</span>
                  <p className="font-mono text-slate-200">{selectedOrder.customerEmail}</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                Plan de Mantenimiento & Aprobación
              </h3>
              {selectedOrder.estimates.length > 0 ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Costo de Operaciones:</span>
                    <span className="text-base font-bold text-white font-mono">
                      ${selectedOrder.estimates[0].grandTotal} USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estado del Plan:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      selectedOrder.estimates[0].status === 'APPROVED' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {selectedOrder.estimates[0].status}
                    </span>
                  </div>
                  {selectedOrder.authorizedBy && (
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                      Autorizado por: <span className="text-emerald-400 font-semibold">{selectedOrder.authorizedBy}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400 space-y-2">
                  <p>Aún no se ha generado plan de mantenimiento formal.</p>
                  <button
                    onClick={() => setActiveTab('estimate')}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Crear Plan de Mantenimiento v1
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: EVIDENCIA FOTOGRÁFICA (Section 6) */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Evidencias de Integridad de Archivos de Sistema
              </h3>
              <p className="text-xs text-slate-400">
                Verificación de hashes criptográficos (SHA-256) antes y después de operaciones reversibles.
              </p>
            </div>
            <button
              onClick={() => setShowEvidenceForm(!showEvidenceForm)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Cargar Evidencia
            </button>
          </div>

          {showEvidenceForm && (
            <form onSubmit={handleAddEvidenceSubmit} className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-4">
              <h4 className="text-xs font-bold text-white font-mono uppercase">Nueva Fotografía de Evidencia</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Ángulo / Cara:</label>
                  <select
                    value={newEvidenceAngle}
                    onChange={(e) => setNewEvidenceAngle(e.target.value as EvidenceAngle)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="system_registry">System Registry Check</option>
                    <option value="file_integrity">File Integrity Hash (SHA-256)</option>
                    <option value="security_log">Security Log Verification</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-400 text-[11px] mb-1">URL de la Imagen o Foto:</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={newEvidenceUrl}
                    onChange={(e) => setNewEvidenceUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Notas de Daño o Inspección:</label>
                <input
                  type="text"
                  placeholder="Detalle de rayones, corrosión o golpes visibles..."
                  value={newEvidenceNotes}
                  onChange={(e) => setNewEvidenceNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEvidenceForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  Registrar Evidencia con Hash
                </button>
              </div>
            </form>
          )}

          {/* Evidences Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedOrder.evidence.map((ev) => (
              <div key={ev.id} className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden group">
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  <img 
                    src={ev.fileUrl} 
                    alt={ev.type}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-cyan-400 uppercase border border-cyan-500/30">
                    {ev.type === 'system_registry' ? 'REGISTRY' : 'FILE_INTEGRITY'}
                  </div>
                  {ev.metadata.damageFlagged && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-500/90 text-white text-[10px] font-mono font-bold uppercase">
                      Daño Observado
                    </div>
                  )}
                </div>

                <div className="p-3.5 space-y-2">
                  <p className="text-xs text-slate-200">
                    {ev.metadata.description || 'Sin notas descriptivas'}
                  </p>
                  {ev.metadata.damageNotes && (
                    <p className="text-[11px] text-rose-300 italic bg-rose-500/10 p-1.5 rounded border border-rose-500/20">
                      {ev.metadata.damageNotes}
                    </p>
                  )}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{new Date(ev.createdAt).toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-slate-400 truncate max-w-[120px]" title={ev.hash}>
                      <Hash className="w-3 h-3 text-cyan-400" />
                      {ev.hash.slice(0, 10)}...
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: CHECK-IN TÉCNICO INICIAL (Section 7) */}
      {activeTab === 'checkin' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Análisis de Integridad Inicial (Fronteras de Diagnóstico)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Evaluación de subsistemas y configuraciones mediante Go API Probes de solo lectura.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(selectedOrder.checkIn.items).map(([key, point]: [string, any]) => {
              const isPass = point.status === 'PASS';
              const isFail = point.status === 'FAIL';
              const isWarning = point.status === 'WARNING';
              return (
                <div 
                  key={key}
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                    isFail 
                      ? 'bg-rose-500/10 border-rose-500/30' 
                      : isWarning
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : isPass
                          ? 'bg-slate-900 border-slate-800'
                          : 'bg-slate-900/60 border-slate-800/60 text-slate-500'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {point.subsystem}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-0.5">
                      {point.name}
                    </h4>
                    {point.notes && (
                      <p className="text-[11px] text-slate-300 mt-1 italic">
                        {point.notes}
                      </p>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                    isFail 
                      ? 'bg-rose-500 text-white' 
                      : isWarning
                        ? 'bg-amber-500 text-slate-950'
                        : isPass
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                  }`}>
                    {point.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: MOTOR DE DIAGNÓSTICO & ADB LAB (Section 8, 9, 11, 12) */}
      {activeTab === 'diagnostic' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Centro de Diagnóstico Automatizado (Safe Windows API)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Diagnóstico de bajo nivel con captura de telemetría y allowlist de probes nativos.
              </p>
            </div>
            <button
              onClick={handleQuickDiagnostic}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              Ejecutar Diagnóstico Windows API
            </button>
          </div>

          {/* Diagnostic Sessions List */}
          {selectedOrder.diagnosticSessions.length > 0 ? (
            selectedOrder.diagnosticSessions.map((sess) => (
              <div key={sess.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-cyan-400">
                      Windows API Sesión: {sess.id}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {sess.status}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Técnico: {sess.technicianName} • {new Date(sess.startedAt).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                  {sess.summary}
                </p>

                {/* Subsystem Tests List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-semibold uppercase text-slate-400">
                    Pruebas Automatizadas de Hardware ({sess.tests.length} tests)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {sess.tests.map((t) => (
                      <div 
                        key={t.id}
                        className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-2 ${
                          t.status === 'FAIL' 
                            ? 'bg-rose-500/10 border-rose-500/40 text-rose-200' 
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{t.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">[{t.subsystem}]</span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1">{t.details}</p>
                          {t.rawOutput && (
                            <pre className="mt-1.5 p-1.5 rounded bg-slate-950 text-[10px] font-mono text-slate-300 overflow-x-auto">
                              {t.rawOutput}
                            </pre>
                          )}
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                          t.status === 'FAIL' ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Findings (Section 12) */}
                {sess.findings.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-mono font-semibold uppercase text-rose-400">
                      Hallazgos Concluyentes del Motor de Diagnóstico
                    </span>
                    {sess.findings.map((f) => (
                      <div key={f.id} className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-400 font-mono">SEVERIDAD: {f.severity}</span>
                          <span className="text-[10px] font-mono bg-rose-500 text-white px-1.5 py-0.2 rounded">FALLA CONFIRMADA</span>
                        </div>
                        <p className="text-white font-semibold">{f.conclusion}</p>
                        <p className="text-slate-300 text-[11px]">{f.observation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <Cpu className="w-8 h-8 mx-auto text-slate-600" />
              <p>No se han ejecutado diagnósticos automatizados en esta orden aún.</p>
              <button
                onClick={handleQuickDiagnostic}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Lanzar Primer Diagnóstico ADB
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: PRESUPUESTO & AUTORIZACIÓN (Section 13 & 14) */}
      {activeTab === 'estimate' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Planes de Mantenimiento Versionados
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Toda operación debe declararse con su riesgo y alcance. Cambios invalidan autorizaciones previas.
              </p>
            </div>
            {selectedOrder.estimates.length > 0 && selectedOrder.estimates[0].status !== 'APPROVED' && (
              <button
                onClick={handleQuickApprove}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                Aprobar con Firma Digital
              </button>
            )}
          </div>

          {/* Existing Estimates */}
          {selectedOrder.estimates.length > 0 ? (
            selectedOrder.estimates.map((est) => (
              <div key={est.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">
                      Plan de Mantenimiento Versión {est.versionNumber} ({est.id})
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      est.status === 'APPROVED' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {est.status}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Emitido por: {est.createdBy} • {new Date(est.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800/60 border-b border-slate-700">
                      <tr>
                        <th className="py-2 px-3">Concepto / Tipo</th>
                        <th className="py-2 px-3">Descripción</th>
                        <th className="py-2 px-3 text-center">Cant.</th>
                        <th className="py-2 px-3 text-right">P. Unit</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {est.items.map((it) => (
                        <tr key={it.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-mono text-cyan-400">{it.type}</td>
                          <td className="py-2.5 px-3 text-white font-medium">{it.description}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{it.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono">${it.unitPrice.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-white">${it.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between pt-3 border-t border-slate-800 gap-4">
                  <div className="text-xs text-slate-400">
                    {est.notes && <p className="italic text-slate-300">"{est.notes}"</p>}
                    {est.approvedBy && (
                      <div className="flex items-center gap-2 mt-1 text-emerald-400 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Aprobado por: {est.approvedBy} ({new Date(est.approvedAt || '').toLocaleString()})
                      </div>
                    )}
                  </div>

                  <div className="w-64 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Mano de obra:</span>
                      <span className="font-mono text-slate-200">${est.laborTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Refacciones:</span>
                      <span className="font-mono text-slate-200">${est.partsTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Impuestos (IVA 16%):</span>
                      <span className="font-mono text-slate-200">${est.taxTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-700">
                      <span>Gran Total:</span>
                      <span className="font-mono text-cyan-400 text-base">${est.grandTotal.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : null}

          {/* Create New Estimate Version Form */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white font-mono uppercase">
              Generar Nueva Versión de Plan de Mantenimiento
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Operación Declarativa (Catálogo):</label>
                <select
                  value={newPartId}
                  onChange={(e) => setNewPartId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {parts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.sku} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Verificación Especializada:</label>
                <input 
                  type="number"
                  value={laborAmount}
                  onChange={(e) => setLaborAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleCreateEstimate}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Publicar Versión del Plan
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: WORKBENCH & WORK LOG (Section 15 & 16) */}
      {activeTab === 'workbench' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                Bitácora de Eventos de Ejecución (Work Log)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Registro auditable secuencial de operaciones Go-native en el sistema host.
              </p>
            </div>
            <button
              onClick={onOpenWorkbench}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
            >
              Ir al Modo Workbench Pantalla Completa
            </button>
          </div>

          {/* Work Log Entry Form */}
          <form onSubmit={handleAddWorkLog} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase">Nueva Entrada en Bitácora</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Categoría:</label>
                <select
                  value={workLogCategory}
                  onChange={(e) => setWorkLogCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="DISASSEMBLY">Desmontaje</option>
                  <option value="REPAIR">Reparación / Microelectrónica</option>
                  <option value="REPLACEMENT">Reemplazo de Pieza</option>
                  <option value="CLEANING">Limpieza Química / Ultrasonido</option>
                  <option value="TEST">Prueba de Banco</option>
                  <option value="ASSEMBLY">Ensamblado & Sellado</option>
                  <option value="INCIDENT">Incidencia / Hallazgo</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-slate-400 text-[11px] mb-1">Acción Ejecutada:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Desmontaje de tapa trasera con plancha a 75°C..."
                  value={workLogAction}
                  onChange={(e) => setWorkLogAction(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Observaciones / Herramientas utilizadas:</label>
              <input
                type="text"
                placeholder="Ej: QianLi iFlex, Alcohol 99.9%, multímetro digital..."
                value={workLogNotes}
                onChange={(e) => setWorkLogNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
            >
              Agregar a la Bitácora
            </button>
          </form>

          {/* Timeline of Logs */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {selectedOrder.workLogs.map((log) => (
                <div key={log.id} className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-400 border-2 border-slate-900" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      [{log.category}]
                    </span>
                    <span className="text-xs font-bold text-white">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {log.notes && (
                    <p className="text-xs text-slate-300 mt-1 bg-slate-800/40 p-2 rounded">
                      {log.notes}
                    </p>
                  )}
                  {log.toolsUsed && log.toolsUsed.length > 0 && (
                    <div className="flex gap-1.5 mt-1.5">
                      {log.toolsUsed.map((tool, i) => (
                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: REFACCIONES & INVENTARIO AUDITABLE (Section 17) */}
      {activeTab === 'parts' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Boxes className="w-4 h-4 text-cyan-400" />
              Registros de Compensación Declarativa
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              El ledger de auditoría almacena QUÉ compensación corresponde. Nunca se almacena código ejecutable ni PowerShell.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white font-mono uppercase">
              Módulos de Compensación Preparados ({selectedOrder.partsConsumed.length})
            </h4>

            {selectedOrder.partsConsumed.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 border-b border-slate-700">
                    <tr>
                      <th className="py-2 px-3">Module SKU</th>
                      <th className="py-2 px-3">Compensation Description</th>
                      <th className="py-2 px-3 text-center">Cantidad</th>
                      <th className="py-2 px-3 text-right">Status</th>
                      <th className="py-2 px-3 text-right">Fecha Consumo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedOrder.partsConsumed.map((pc, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono text-cyan-400 font-bold">{pc.sku}</td>
                        <td className="py-2.5 px-3 text-white">{pc.name}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">{pc.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">READY</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                          {new Date(pc.consumedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
            <p className="text-xs text-slate-400 italic">No se han preparado compensaciones reversibles.</p>
            )}

            {/* Quick Part Consumption Action */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <select
                id="quickPartSelect"
                className="text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              >
                {parts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.sku} - {p.name} (Stock: {p.stock})
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  const selectEl = document.getElementById('quickPartSelect') as HTMLSelectElement;
                  if (selectEl) {
                    consumePartForOrder(selectedOrder.id, selectEl.value, 1);
                  }
                }}
                className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
              >
                Preparar Backup de Compensación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 8: CONTROL DE CALIDAD (QC) & BEFORE/AFTER (Section 18 & 19) */}
      {activeTab === 'qc' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Control de Calidad (QC) y Comparativa Antes / Después
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verificación semántica posterior de la restauración/compensación para garantizar estado íntegro.
              </p>
            </div>
            {(!selectedOrder.qualityControl || selectedOrder.qualityControl.status !== 'PASSED') && (
              <button
                onClick={handleQuickPassQC}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Aprobar Certificación QC 100%
              </button>
            )}
          </div>

          {/* Before & After Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/30 space-y-2">
              <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">
                ESTADO INICIAL (ANTES)
              </span>
              <p className="text-xs text-white font-semibold">
                Hosts: {selectedOrder.intakeReason}
              </p>
              <p className="text-[11px] text-slate-400">
                Hosts: FAIL. Registry redirection active pointing to malicious external nodes.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                ESTADO FINAL (DESPUÉS)
              </span>
              <p className="text-xs text-white font-semibold">
                Hosts File RESTORED (SHA-256 Validated)
              </p>
              <p className="text-[11px] text-slate-400">
                Malicious redirections eliminated. System file identical to pristine Microsoft catalog state.
              </p>
            </div>
          </div>

          {/* QC Inspection Details if evaluated */}
          {selectedOrder.qualityControl && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white">
                  Dictamen de Auditoría QC: {selectedOrder.qualityControl.status}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Por: {selectedOrder.qualityControl.performedBy} ({new Date(selectedOrder.qualityControl.performedAt).toLocaleDateString()})
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                {selectedOrder.qualityControl.checklist.map((qc) => (
                  <div key={qc.id} className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                    <span className="text-slate-200">{qc.name}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {qc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 9: ENTREGA, PAGO & GARANTÍA (Section 20 & 21) */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Cierre Económico, Entrega y Emisión de Garantía
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Validación de cliente, dispositivo, pago total, firma de conformidad y generación de póliza inmutable.
            </p>
          </div>

          {selectedOrder.status === 'CLOSED' || selectedOrder.delivery ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Receipt */}
              <div className="p-5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-3">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                  RECIBO DE ENTREGA FINAL
                </span>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400">Receptor:</span>
                    <p className="font-semibold text-white">{selectedOrder.delivery?.receiverName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Identificación:</span>
                    <p className="font-mono text-slate-200">{selectedOrder.delivery?.receiverIdentification}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Fecha y Hora de Entrega:</span>
                    <p className="font-mono text-slate-200">
                      {selectedOrder.delivery?.deliveredAt ? new Date(selectedOrder.delivery.deliveredAt).toLocaleString() : '-'}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-400 block mb-1">Firma Digital de Conformidad:</span>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center text-cyan-400 font-mono text-xs">
                      [FIRMA REGISTRADA EN ARCHIVO AUDITADO]
                    </div>
                  </div>
                </div>
              </div>

              {/* Warranty Policy */}
              <div className="p-5 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-3">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  PÓLIZA DE GARANTÍA VINCULADA
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Número de Póliza:</span>
                    <span className="font-mono font-bold text-white">{selectedOrder.warranty?.policyNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vigencia:</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedOrder.warranty?.durationDays} días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fecha Límite:</span>
                    <span className="font-mono text-slate-200">{selectedOrder.warranty?.endDate}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 bg-slate-800/60 p-2 rounded">
                    {selectedOrder.warranty?.terms}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 max-w-xl">
              <h4 className="text-xs font-bold text-white font-mono uppercase">
                Registrar Entrega y Cobro
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Monto a Cobrar ($ USD):</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Método de Pago:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="CARD">Tarjeta de Crédito / Débito</option>
                    <option value="CASH">Efectivo</option>
                    <option value="TRANSFER">Transferencia SPEI / Wire</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Nombre de quien recoge:</label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Identificación Oficial (DNI / INE):</label>
                  <input
                    type="text"
                    value={receiverDni}
                    onChange={(e) => setReceiverDni(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleDeliveryAndClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-emerald-600/20"
              >
                Cerrar Orden, Registrar Pago y Emitir Póliza de Garantía
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 10: AUDITORÍA INMUTABLE (Section 23) */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Auditoría Inmutable de la Orden: WHO, WHAT, WHEN, WHERE, WHY, RESULT
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cero pérdida de contexto. Cada transición crítica cuenta con sello criptográfico verificable.
            </p>
          </div>

          <div className="space-y-3">
            {orderAuditLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">
                      [{log.actionType}]
                    </span>
                    <span className="text-white font-bold">{log.what}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    log.result === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {log.result}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-400">
                  <div>
                    <span className="text-slate-500 block">WHO:</span>
                    <span className="text-slate-200">{log.who.name} ({log.who.role})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">WHEN:</span>
                    <span className="text-slate-200 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">WHERE:</span>
                    <span className="text-slate-200">{log.where}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">WHY:</span>
                    <span className="text-slate-200">{log.why}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="truncate max-w-md">{log.payloadSummary}</span>
                  <span className="text-cyan-400">{log.hash.slice(0, 16)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
