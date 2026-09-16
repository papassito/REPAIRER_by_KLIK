import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Camera, 
  FileCheck, 
  ShieldCheck, 
  Zap, 
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { useRepairer } from '../../context/RepairerContext';
import { QCItem } from '../../types/repairer';

interface QualityControlViewProps {
  onSelectOrder: (orderId: string) => void;
}

export const QualityControlView: React.FC<QualityControlViewProps> = ({ onSelectOrder }) => {
  const { orders, completeQualityControl, setActiveOrderId } = useRepairer();

  // Orders that are currently in or ready for QC
  const qcEligibleOrders = orders.filter(o => 
    o.status === 'IN_REPAIR' || 
    o.status === 'REPAIR_COMPLETED' || 
    o.status === 'QUALITY_CONTROL' || 
    o.status === 'READY_FOR_PICKUP'
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string>(qcEligibleOrders[0]?.id || orders[0]?.id || '');

  const currentOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  const defaultQCList: QCItem[] = [
    { id: 'qc_1', name: 'Filtro etc/hosts restaurado', status: 'PASS', notes: 'Go-native write matches original configuration hash.' },
    { id: 'qc_2', name: 'Servicio spooler.exe reactivado', status: 'PASS' },
    { id: 'qc_3', name: 'Ausencia de inyecciones PowerShell o cmd strings', status: 'PASS' },
    { id: 'qc_4', name: 'Validación de firma de Microsoft de la dll spooler', status: 'PASS' },
    { id: 'qc_5', name: 'Ledger de auditoría declarativo persistido con anterior hash', status: 'PASS' },
    { id: 'qc_6', name: 'Ningún comando libre detectado en la entrada de ledger', status: 'PASS' }
  ];

  const [checklist, setChecklist] = useState<QCItem[]>(defaultQCList);
  const [qcNotes, setQcNotes] = useState('Equipo certificado en estación de QC conforme a tolerancias de fábrica.');

  const toggleStatus = (id: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'PASS' ? 'FAIL' : 'PASS';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleCertifyQC = () => {
    if (!currentOrder) return;
    const allPassed = checklist.every(i => i.status === 'PASS');
    completeQualityControl(
      currentOrder.id,
      allPassed,
      checklist,
      {
            initialSymptom: currentOrder.intakeReason,
            initialFaultConfirmed: 'Falla confirmada en etc/hosts',
            repairedSolution: 'Reemplazo declarativo etc/hosts',
            postRepairValidation: 'Hash verificado'
      },
      qcNotes
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-white font-display">
              ESTACIÓN DE CONTROL DE CALIDAD (WINDOWS QC & BEFORE/AFTER)
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              AUDITORÍA OBLIGATORIA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            "Toda mutación en el sistema Windows debe auditarse semánticamente y registrarse en el ledger declarativo."
          </p>
        </div>

        {/* Order Selector */}
        {currentOrder && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-mono">Dispositivo a Auditar:</label>
            <select
              value={currentOrder.id}
              onChange={(e) => {
                setSelectedOrderId(e.target.value);
                setActiveOrderId(e.target.value);
              }}
              className="text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono cursor-pointer"
            >
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} - {o.deviceSummary} [{o.status}]
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {currentOrder && (
        <>
          {/* Section 19: Comparative BEFORE vs AFTER */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              Sección 19: Comparativa Obligatoria de Entrada vs Salida
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ENTRADA (BEFORE) */}
              <div className="p-5 rounded-xl bg-slate-900 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase">
                    ESTADO DE ENTRADA (CHECK-IN)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                    ANOMALÍA REPORTADA
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-white font-bold">
                    Síntoma Inicial de Windows: "{currentOrder.intakeReason}"
                  </p>
                  <p className="text-slate-400">
                    Lectura Eléctrica: <strong className="text-rose-400 font-mono">0.00V / 0.00mA (Circuito Abierto)</strong>
                  </p>
                  <p className="text-slate-400">
                    Probes Windows API: Hijacked redirections detected. Spooler service stopped.
                  </p>
                </div>
              </div>

              {/* SALIDA (AFTER) */}
              <div className="p-5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                    ESTADO DE SALIDA (POST-REPARACIÓN)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    NORMALIZADO
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-white font-bold">
                    Solución Técnica: Reemplazo declarativo etc/hosts y spooler startup correction.
                  </p>
                  <p className="text-slate-400">
                    Lectura Eléctrica: <strong className="text-emerald-400 font-mono">9.12V / 2.45A (Super Fast Charging 25W)</strong>
                  </p>
                  <p className="text-slate-400">
                    Verificación: Hashing de archivos coincide con baseline Microsoft 100% OK.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 18: Quality Control Checklist */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Lista de Verificación de Tolerancias QC (18. CONTROL DE CALIDAD)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Haga clic para validar o marcar anomalías en cada punto crítico.
                </p>
              </div>

              <span className="text-xs font-mono text-cyan-400">
                Aprobados: {checklist.filter(c => c.status === 'PASS').length} / {checklist.length}
              </span>
            </div>

            <div className="space-y-2">
              {checklist.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => toggleStatus(item.id)}
                  className="p-3.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{item.name}</p>
                    {item.notes && <p className="text-[11px] text-slate-400 italic mt-0.5">{item.notes}</p>}
                  </div>

                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    item.status === 'PASS' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {item.status === 'PASS' ? '✓ APROBADO' : '✕ RECHAZADO'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-slate-400 text-xs font-mono mb-1">Dictamen del Auditor QC:</label>
              <textarea
                rows={2}
                value={qcNotes}
                onChange={(e) => setQcNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => onSelectOrder(currentOrder.id)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-700 cursor-pointer"
              >
                Ver Orden Completa
              </button>
              <button
                onClick={handleCertifyQC}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                Certificar y Marcar Lista para Entrega
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
