import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Smartphone, 
  Camera, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  PenTool,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useRepairer } from '../../context/RepairerContext';

interface CustomerPortalModalProps {
  onClose: () => void;
}

export const CustomerPortalModal: React.FC<CustomerPortalModalProps> = ({ onClose }) => {
  const { selectedOrder, orders, setActiveOrderId, approveEstimate } = useRepairer();
  const [signerName, setSignerName] = useState('');
  const [hasSigned, setHasSigned] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const activeOrder = selectedOrder || orders[0];

  if (!activeOrder) return null;

  const currentEstimate = activeOrder.estimates[0];
  const isApproved = currentEstimate && currentEstimate.status === 'APPROVED';

  const handleApprove = () => {
    if (!signerName || !currentEstimate) return;
    setIsApproving(true);
    setTimeout(() => {
      approveEstimate(
        activeOrder.id,
        currentEstimate.id,
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><path d="M10 30 Q 50 10 90 35 T 150 20" stroke="%2306b6d4" stroke-width="3" fill="none"/></svg>',
        signerName
      );
      setHasSigned(true);
      setIsApproving(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header Customer-facing */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-cyan-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                PORTAL DE AUTORIZACIÓN DE PLAN (REPAIRER CORE)
              </span>
              <h2 className="text-base font-bold text-white font-display">
                Seguimiento de Reparación: {activeOrder.orderNumber}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Order Info & Live Status */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Equipo en Taller:</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {activeOrder.status}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">
              Host: {activeOrder.deviceSummary}
            </h3>
            <p className="text-xs text-slate-300">
              Titular: <span className="font-semibold text-white">{activeOrder.customerName}</span> • Motivo: <span className="italic">"{activeOrder.intakeReason}"</span>
            </p>
          </div>

          {/* Photographic Evidence for Customer (Section 26) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-white uppercase flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                Evidencias de Integridad del Host Windows
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeOrder.evidence.length} fotos certificadas
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {activeOrder.evidence.slice(0, 3).map((ev) => (
                <div key={ev.id} className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-700">
                  <img src={ev.fileUrl} alt={ev.type} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.2 bg-black/80 rounded text-[9px] font-mono text-cyan-400 uppercase">
                    {ev.type === 'system_registry' ? 'REGISTRY' : 'FILE_INTEGRITY'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic & Technical Conclusion */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <span className="text-xs font-bold font-mono text-cyan-400 uppercase">
              Dictamen Técnico Transparente
            </span>
            <p className="text-xs text-slate-200">
              Se detectó una desviación crítica en el archivo etc/hosts con redirecciones no autorizadas. Adicionalmente, el servicio spooler.exe de cola de impresión local está bloqueado.
            </p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> El sistema de archivos y el bootloader de Windows están íntegros y no hay riesgo para los datos.
            </p>
          </div>

          {/* Estimate & Digital Authorization Pad */}
          {currentEstimate && (
            <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-cyan-400" />
                    Plan de Operaciones Propuestas (Versión {currentEstimate.versionNumber})
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Garantía incluida: 90 días en refacciones y mano de obra
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">OPERACIÓN</span>
                  <span className="text-lg font-bold font-mono text-cyan-400">
                    ${currentEstimate.grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-1.5 text-xs">
                {currentEstimate.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-1 border-b border-slate-700/50">
                    <span className="text-slate-300">{item.description}</span>
                    <span className="font-mono text-white">${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Approval Section */}
              {isApproved || hasSigned ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <h5 className="text-xs font-bold text-emerald-300 uppercase font-mono">
                    Plan de Mantenimiento Autorizado
                  </h5>
                  <p className="text-xs text-slate-300">
                    Firmado por: <strong>{currentEstimate.approvedBy || signerName}</strong> con sello criptográfico registrado.
                  </p>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-700 space-y-3">
                  <label className="block text-xs font-mono text-slate-300">
                    Para autorizar el inicio del plan de mantenimiento, ingrese su firma de administrador y autorice:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Escriba su Firma (ej: Carlos Mendoza)"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  />
                  <button
                    onClick={handleApprove}
                    disabled={!signerName || isApproving}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <PenTool className="w-4 h-4" />
                    {isApproving ? 'Registrando Autorización de Plan...' : 'Firmar y Autorizar Plan de Mantenimiento'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Conexión Cifrada • KLIK Customer Shield</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold"
          >
            Cerrar Portal
          </button>
        </div>
      </div>
    </div>
  );
};
