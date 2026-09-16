import React, { useState } from 'react';
import { 
  Cpu, 
  Battery, 
  HardDrive, 
  Usb, 
  Wrench, 
  Boxes, 
  Terminal, 
  Play, 
  FileCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Clock, 
  Send,
  Plus
} from 'lucide-react';
import { useRepairer } from '../../context/RepairerContext';
import { ADB_ALLOWLIST } from '../../types/repairer';

interface TechnicianWorkbenchProps {
  onOpenLifecycle: () => void;
}

export const TechnicianWorkbench: React.FC<TechnicianWorkbenchProps> = ({ onOpenLifecycle }) => {
  const { 
    selectedOrder, 
    orders, 
    setActiveOrderId,
    runDiagnosticSession, 
    addWorkLogEntry, 
    consumePartForOrder, 
    parts,
    executeAdbCommand
  } = useRepairer();

  const [selectedQuickCommand, setSelectedQuickCommand] = useState(ADB_ALLOWLIST[0]);
  const [commandOutput, setCommandOutput] = useState<string | null>(null);
  const [isExecutingCommand, setIsExecutingCommand] = useState(false);

  const [workLogCategory, setWorkLogCategory] = useState<any>('REPAIR');
  const [workLogAction, setWorkLogAction] = useState('');
  const [workLogNotes, setWorkLogNotes] = useState('');

  const [partToConsumeId, setPartToConsumeId] = useState(parts[0]?.id || '');

  // If no order selected or user wants to switch
  const activeOrder = selectedOrder || orders[0];

  const handleRunCommand = async () => {
    setIsExecutingCommand(true);
    try {
      const res = await executeAdbCommand(selectedQuickCommand);
      setCommandOutput(`[CMD]: ${selectedQuickCommand}\n[EXIT CODE]: ${res.exitCode}\n[OUTPUT]:\n${res.output}`);
    } catch (err: any) {
      setCommandOutput(`[ERROR]: ${err.message}`);
    } finally {
      setIsExecutingCommand(false);
    }
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation Layer
    if (!activeOrder) return;
    if (workLogAction.trim().length < 5) {
      // In a real app, you would show a user-friendly error message.
      console.error("Validation failed: Action must be at least 5 characters long.");
      return;
    }

    addWorkLogEntry(activeOrder.id, {
      category: workLogCategory,
      action: workLogAction,
      notes: workLogNotes
    });
    setWorkLogAction('');
    setWorkLogNotes('');
  };

  const handleConsumePart = () => {
    if (!activeOrder || !partToConsumeId) return;
    consumePartForOrder(activeOrder.id, partToConsumeId, 1);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Workbench Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
            <h1 className="text-xl md:text-2xl font-bold text-white font-display">
              PUESTO DE TRABAJO TÉCNICO (WORKBENCH)
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              BANCO TÉCNICO #1
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Entorno técnico centralizado para diagnóstico de bajo nivel, manipulación de hardware y consumo de refacciones.
          </p>
        </div>

        {/* Order Selector Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">Orden en Banco:</label>
          <select
            value={activeOrder?.id}
            onChange={(e) => setActiveOrderId(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono cursor-pointer"
          >
            {orders.map(o => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} - {o.deviceSummary} ({o.status})
              </option>
            ))}
          </select>
          <button
            onClick={onOpenLifecycle}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer"
          >
            Ver Ciclo
          </button>
        </div>
      </div>

      {activeOrder && (
        <>
          {/* Section 29, Point 1: DEVICE HEADER */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500">DISPOSITIVO</span>
              <p className="text-sm font-bold text-white mt-0.5 truncate">{activeOrder.deviceSummary}</p>
              <span className="text-[11px] text-slate-400">Cliente: {activeOrder.customerName}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500">IMEI 1 / SERIAL</span>
              <p className="text-xs font-mono text-cyan-400 mt-0.5 font-semibold">
                {activeOrder.deviceSummary.includes('A54') ? '358941098234123' : '354891029381729'}
              </p>
              <span className="text-[11px] text-slate-400 font-mono">SN: R5CTA0X9Y1Z</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500">SISTEMA OPERATIVO</span>
              <p className="text-xs font-mono text-white mt-0.5 font-medium">Android 14 (One UI 6.1)</p>
              <span className="text-[10px] text-slate-400 font-mono">Build: UP1A.231005.007</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500">ESTADO OPERATIVO</span>
              <p className="text-xs font-mono font-bold text-blue-400 mt-0.5">{activeOrder.status}</p>
              <span className="text-[10px] text-amber-400 font-mono">Prioridad: {activeOrder.priority}</span>
            </div>
            <div className="flex items-center justify-end">
              <button
                onClick={() => runDiagnosticSession(activeOrder.id, 'ADB')}
                className="w-full md:w-auto px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                Diagnosticar ADB
              </button>
            </div>
          </div>

          {/* Section 29, Point 2: HARDWARE STATUS CHECK */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              HARDWARE STATUS CHECK (TELEMETRÍA EN VIVO)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* CPU */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-emerald-400" /> CPU
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    ✓ NORMAL
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-300">
                  Exynos 1380 Octa-Core
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Temp: 32°C • Clock: 2.4GHz</span>
              </div>

              {/* RAM */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-emerald-400" /> RAM
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    ✓ NORMAL
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-300">
                  8 GB LPDDR4X (4.8 GB libre)
                </div>
                <span className="text-[10px] text-slate-500 font-mono">ZRAM: 4 GB Activo</span>
              </div>

              {/* STORAGE */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-amber-400" /> STORAGE
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    ⚠ HEALTH 64%
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-300">
                  128 GB UFS 2.2 (82% Ocupado)
                </div>
                <span className="text-[10px] text-amber-400 font-mono">Vida útil reducida por escrituras</span>
              </div>

              {/* BATTERY */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Battery className="w-4 h-4 text-rose-400" /> BATTERY
                  </span>
                  <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                    ✕ DEGRADADA
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-300">
                  1,240 Ciclos (Health: 71%)
                </div>
                <span className="text-[10px] text-rose-400 font-mono">Resistencia interna elevada</span>
              </div>

              {/* USB PORT */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Usb className="w-4 h-4 text-rose-400" /> USB PORT
                  </span>
                  <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                    ✕ FALLA CC1
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-300">
                  Consumo: 0mA (Abierto)
                </div>
                <span className="text-[10px] text-rose-400 font-mono">Sulfatación en línea VBUS</span>
              </div>
            </div>
          </div>

          {/* Section 29, Point 3: HERRAMIENTAS RÁPIDAS & COMMAND CONSOLE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick ADB Console with Allowlist */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Terminal ADB Allowlist (Zero Trust)
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ALLOWLIST ACTIVA
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedQuickCommand}
                  onChange={(e) => setSelectedQuickCommand(e.target.value)}
                  className="flex-1 text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                >
                  {ADB_ALLOWLIST.map((cmd, i) => (
                    <option key={i} value={cmd}>
                      adb shell {cmd}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleRunCommand}
                  disabled={isExecutingCommand}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Ejecutar
                </button>
              </div>

              <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-cyan-400 border border-slate-800 h-48 overflow-y-auto">
                {commandOutput ? (
                  <pre className="whitespace-pre-wrap">{commandOutput}</pre>
                ) : (
                  <span className="text-slate-600">
                    // Salida del comando ADB aparecerá aquí...
                    // Ejecute 'dumpsys battery' o 'getprop' para obtener telemetría directa.
                  </span>
                )}
              </div>
            </div>

            {/* Quick Part Consumption & Work Log */}
            <div className="space-y-4">
              {/* Part Consumption */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-cyan-400" />
                  Descontar Refacción para esta Orden
                </h3>
                <div className="flex items-center gap-2">
                  <select
                    value={partToConsumeId}
                    onChange={(e) => setPartToConsumeId(e.target.value)}
                    className="flex-1 text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {parts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.sku} - {p.name} (Stock: {p.stock})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleConsumePart}
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Consumir Pieza
                  </button>
                </div>
              </div>

              {/* Quick Work Log */}
              <form onSubmit={handleAddLog} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  Registrar Avance en Bitácora
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={workLogCategory}
                    onChange={(e) => setWorkLogCategory(e.target.value)}
                    className="text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="REPAIR">Reparación</option>
                    <option value="DISASSEMBLY">Desensamble</option>
                    <option value="TEST">Prueba</option>
                    <option value="ASSEMBLY">Cierre</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Acción técnica realizada..."
                    value={workLogAction}
                    onChange={(e) => setWorkLogAction(e.target.value)}
                    className="col-span-2 text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Detalles / Herramientas / Hallazgos..."
                  value={workLogNotes}
                  onChange={(e) => setWorkLogNotes(e.target.value)}
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer"
                >
                  Agregar a Bitácora Técnica Inmutable
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
