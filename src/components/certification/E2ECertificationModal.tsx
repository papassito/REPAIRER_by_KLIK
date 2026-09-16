import React, { useState } from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  Play, 
  RotateCw, 
  ShieldCheck, 
  Cpu, 
  FileText, 
  Smartphone, 
  Boxes, 
  Clock, 
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useRepairer } from '../../context/RepairerContext';

interface E2ECertificationModalProps {
  onClose: () => void;
  onOpenOrder: (orderId: string) => void;
}

export const E2ECertificationModal: React.FC<E2ECertificationModalProps> = ({ onClose, onOpenOrder }) => {
  const { runE2ECertificationStep, orders } = useRepairer();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [stepResults, setStepResults] = useState<Record<number, { success: boolean; message: string; timestamp: string }>>({});

  const STEPS = [
    { num: 1, title: 'Identificar Host Windows Target', desc: 'Detección de sistema operativo, hostname, arquitectura y disco SSD.' },
    { num: 2, title: 'Recopilar Observaciones (READ_ONLY)', desc: 'Sondeo de estado de etc/hosts y estado de spooler.exe sin alterar.' },
    { num: 3, title: 'Generar Plan de Mantenimiento Inerte', desc: 'Definir operaciones exactas y versión de contratos sin ejecutar.' },
    { num: 4, title: 'Clasificar Operaciones', desc: 'Asignación de clase de riesgo única a cada operación (por ejemplo: REVERSIBLE).' },
    { num: 5, title: 'Validar Plan y Precondiciones', desc: 'Comprobación de privilegios mínimos del ejecutor y concordancia.' },
    { num: 6, title: 'Explicar Alcance y Efectos', desc: 'Visualización clara en UI de clases de riesgo y políticas de rollback.' },
    { num: 7, title: 'Recoger Autorización del Usuario', desc: 'Firma digital ligada al digest del plan exacto (un solo uso, expirable).' },
    { num: 8, title: 'Preparar Backup de Compensación', desc: 'Crear material de respaldo verificado del archivo etc/hosts.' },
    { num: 9, title: 'Validar Sello de Integridad del Backup', desc: 'Hashing SHA-256 antes de comenzar cualquier mutación.' },
    { num: 10, title: 'Ejecutar Mutación (Go Core File System API)', desc: 'Modificación del archivo de etc/hosts y remoción de redirecciones.' },
    { num: 11, title: 'Verificar Estado Posterior (Post-conditions)', desc: 'Comparación semántica del archivo hosts modificado con hash esperado.' },
    { num: 12, title: 'Escribir Registro Declarativo del Ledger', desc: 'Emisión de JSON con descriptor de compensación libre de PowerShell/shell.' },
    { num: 13, title: 'Consolidar Cadena de Hashes del Ledger', desc: 'Vincular secuencia previa para asegurar detección de alteraciones locales.' },
    { num: 14, title: 'Prueba de Compensación (Rollback Engine)', desc: 'Lectura de descriptor, verificación de backup, restauración nativa en Go.' },
    { num: 15, title: 'Verificación Semántica de Rollback', desc: 'Comprobar que el hosts original ha sido recuperado perfectamente.' },
    { num: 16, title: 'Cierre Seguro de Sesión', desc: 'Liberación de recursos con mínimo privilegio y registro de auditoría final.' }
  ];

  const handleRunNext = async (stepNum: number) => {
    const res = await runE2ECertificationStep(stepNum);
    setStepResults(prev => ({
      ...prev,
      [stepNum]: {
        success: res.success,
        message: res.message,
        timestamp: new Date().toLocaleTimeString()
      }
    }));
    if (stepNum < 16) {
      setCurrentStepIndex(stepNum);
    }
  };

  const handleRunAllSteps = async () => {
    setIsRunningAll(true);
    for (let i = 1; i <= 16; i++) {
      await handleRunNext(i);
      // Pequeña pausa de animación
      await new Promise(r => setTimeout(r, 200));
    }
    setIsRunningAll(false);
  };

  const completedCount = Object.values(stepResults).filter(r => r.success).length;
  const isFullyCertified = completedCount === 16;

  // Find the A54 order
  const a54Order = orders.find(o => o.deviceSummary.includes('A54'));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm md:text-base font-bold text-white font-display">
                  E2E SYSTEM LIFECYCLE CERTIFICATION
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  WINDOWS CORE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Workstation: <strong className="text-white">Windows 11 Workstation-A1</strong> • Falla: <strong className="text-rose-400">"etc/hosts Redirection"</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status & Action Bar */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-300">
                  Progreso de Certificación Técnica Windows Core:
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {completedCount} de 16 Pasos Aprobados
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isFullyCertified 
                  ? '✓ CERTIFICADO: El ciclo de vida Go-native de REPAIRER cumple con la especificación docs-0.1.1.' 
                  : 'Ejecute en un solo clic para certificar que el motor de reversibilidad de etc/hosts funciona sin PowerShell.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunAllSteps}
                disabled={isRunningAll}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isRunningAll ? 'Validando 16 Pasos...' : 'Certificar Todo el Flujo (1-Click)'}
              </button>

              {a54Order && (
                <button
                  onClick={() => {
                    onOpenOrder(a54Order.id);
                    onClose();
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  Abrir Orden <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* 16 Steps List */}
          <div className="space-y-2">
            {STEPS.map((step) => {
              const res = stepResults[step.num];
              const isDone = res && res.success;
              return (
                <div
                  key={step.num}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-colors ${
                    isDone 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isDone 
                        ? 'bg-emerald-500 text-slate-950' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">
                          Paso {step.num}: {step.title}
                        </h4>
                        {isDone && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded font-bold">
                            PASS ({res.timestamp})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {step.desc}
                      </p>
                      {res && (
                        <p className="text-[11px] text-emerald-300 font-mono mt-1">
                          ↳ {res.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRunNext(step.num)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium border border-slate-700 hover:text-white shrink-0 cursor-pointer"
                  >
                    Ejecutar
                  </button>
                </div>
              );
            })}
          </div>

          {/* Success Banner if all certified */}
          {isFullyCertified && (
            <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-300 font-display">
                CERTIFICACIÓN DE CICLO WINDOWS COMPLETADA AL 100%
              </h3>
              <p className="text-xs text-slate-300 max-w-lg mx-auto">
                El sistema de mantenimiento ha identificado un target Windows, generado un plan inerte, clasificado sus operaciones como REVERSIBLE, obtenido consentimiento explícito, tomado backup etc/hosts, aplicado la mutación y ejecutado exitosamente un rollback Go nativo 100% verificado.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">
            Repairer by KLIK • E2E Test Runner v2.6.4
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold"
          >
            Cerrar Certificador
          </button>
        </div>
      </div>
    </div>
  );
};
