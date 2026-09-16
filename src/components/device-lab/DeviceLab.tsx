import React, { useState } from 'react';
import { 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  RefreshCw, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Battery, 
  HardDrive, 
  Layers, 
  Zap, 
  ShieldAlert,
  Play,
  RotateCw
} from 'lucide-react';
import { useRepairer } from '../../context/RepairerContext';
import { ADB_ALLOWLIST, DeviceConnectionState } from '../../types/repairer';

export const DeviceLab: React.FC = () => {
  const { 
    deviceConnectionState, 
    connectedDevice, 
    setDeviceConnectionState, 
    executeAdbCommand, 
    auditLogs 
  } = useRepairer();

  const [selectedCommand, setSelectedCommand] = useState(ADB_ALLOWLIST[0]);
  const [customCommand, setCustomCommand] = useState('');
  const [consoleLogs, setConsoleLogs] = useState<Array<{ text: string; type: 'info' | 'output' | 'error' | 'security' }>>([
    { text: 'REPAIRER-CORE-BRIDGE engine initialized v0.1.1 (Windows)', type: 'info' },
    { text: 'Enforcing strict Zero-Trust Go API Command Allowlist Policy.', type: 'info' },
    { text: 'Target host connection established.', type: 'info' }
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const adbAuditLogs = auditLogs.filter(a => a.actionType === 'ADB_COMMAND' || a.actionType === 'SECURITY_VIOLATION');

  const addLog = (text: string, type: 'info' | 'output' | 'error' | 'security') => {
    setConsoleLogs(prev => [...prev, { text, type }]);
  };

  const handleExecute = async (cmdToRun: string) => {
    setIsRunning(true);
    addLog(`$ repairer probe ${cmdToRun}`, 'info');

    try {
      const res = await executeAdbCommand(cmdToRun);
      addLog(res.output, 'output');
    } catch (err: any) {
      addLog(`SECURITY / EXECUTION ERROR: ${err.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const simulateStateTransition = (newState: DeviceConnectionState) => {
    setDeviceConnectionState(newState);
    addLog(`State machine transition: ${deviceConnectionState} -> ${newState}`, 'info');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-white font-display">
              CORE WINDOWS OBSERVATION LAB & PROBES
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              CORE ENGINE v0.1.1
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Consola de observación de bajo nivel. Ejecuta probes permitidos y audita violaciones de seguridad o inyecciones de shell.
          </p>
        </div>

        {/* Connection State Simulator */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1.5">
          <span className="text-[11px] font-mono text-slate-400 pl-2">Simular Estado:</span>
          <button
            onClick={() => simulateStateTransition('USB_DETECTED')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono rounded text-amber-300"
          >
            USB_DETECTED
          </button>
          <button
            onClick={() => simulateStateTransition('ADB_UNAUTHORIZED')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono rounded text-rose-300"
          >
            UNAUTHORIZED
          </button>
          <button
            onClick={() => simulateStateTransition('ADB_READY')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono rounded text-emerald-300"
          >
            ADB_READY
          </button>
          <button
            onClick={() => simulateStateTransition('DISCONNECTED')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono rounded text-slate-400"
          >
            DESCONECTAR
          </button>
        </div>
      </div>

      {/* Section 32: Device State Machine Diagram */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Estado de la Sesión de Ejecución
          </span>
          <span className="text-xs font-mono text-cyan-400">
            Estado Actual: <strong className="text-white">{deviceConnectionState}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-[10px] font-mono">
          {[
            { id: 'UNKNOWN', label: '1. DRAFT' },
            { id: 'USB_DETECTED', label: '2. VALIDATED' },
            { id: 'ADB_UNAUTHORIZED', label: '3. BLOCKED' },
            { id: 'ADB_READY', label: '4. AUTHORIZED' },
            { id: 'DIAGNOSTIC_SESSION', label: '5. RUNNING' },
            { id: 'FASTBOOT', label: 'COMPENSATED' },
            { id: 'DISCONNECTED', label: 'DISCONNECTED' }
          ].map((st) => {
            const isCurrent = deviceConnectionState === st.id;
            return (
              <div 
                key={st.id}
                className={`px-3 py-1.5 rounded-lg border whitespace-nowrap font-bold ${
                  isCurrent 
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20' 
                    : 'bg-slate-800/40 text-slate-500 border-slate-800'
                }`}
              >
                {st.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Connected Device Spec & Telemetry Panel */}
      {connectedDevice && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  {connectedDevice.model}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Host UUID: {connectedDevice.imei1} • Serial: {connectedDevice.serialNumber}
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              HOST WINDOWS DETECTADO
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Operating System Build</span>
              <p className="font-bold text-white mt-0.5">{connectedDevice.operatingSystem}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Processor Arch</span>
              <p className="font-bold text-white mt-0.5">{connectedDevice.processor || 'Exynos 1380 Octa-Core'}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Memoria RAM / Storage</span>
              <p className="font-bold text-white mt-0.5">{connectedDevice.ram} / {connectedDevice.storage}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Storage Architecture</span>
              <p className="font-bold text-white mt-0.5">{connectedDevice.batteryCapacity} mAh</p>
            </div>
          </div>
        </div>
      )}

      {/* Command Center: Allowlist Selector + Terminal Output */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Allowed Commands & Zero Trust Policy */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Catalog of Safe Probes (Allowlist)
            </h3>
            <p className="text-[11px] text-slate-400">
              Only pre-authorized Go API observations can be requested by user interface for security.
            </p>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {ADB_ALLOWLIST.map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedCommand(cmd);
                    handleExecute(cmd);
                  }}
                  className="w-full text-left p-2 rounded bg-slate-800/60 hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-slate-700/50 text-[11px] font-mono text-slate-300 transition-colors flex items-center justify-between"
                >
                  <span className="truncate">repairer probe {cmd}</span>
                  <Play className="w-3 h-3 text-cyan-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Test Forbidden Command (to verify Zero-Trust rejection) */}
          <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/30 space-y-3">
            <h3 className="text-xs font-bold text-rose-300 font-mono uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Prueba de Bloqueo Zero-Trust
            </h3>
            <p className="text-[11px] text-slate-400">
              Intente ejecutar un comando shell o Powershell. Compruebe que es bloqueado, denegado y auditado en el ledger de forma cerrada.
            </p>
            <button
              onClick={() => handleExecute('powershell.exe Copy-Item C:\\Windows')}
              className="w-full py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-mono font-semibold cursor-pointer"
            >
              Intentar inyección de PowerShell
            </button>
          </div>
        </div>

        {/* Right: Terminal Console Output */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>REPAIRER CONSOLE (PURE GO APIS)</span>
              </div>
              <button
                onClick={() => setConsoleLogs([])}
                className="text-[10px] font-mono text-slate-500 hover:text-slate-300"
              >
                Limpiar Terminal
              </button>
            </div>

            {/* Terminal Window */}
            <div className="h-80 overflow-y-auto bg-black/80 rounded-lg p-3 font-mono text-xs space-y-1.5 border border-slate-900">
              {consoleLogs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={`leading-relaxed ${
                    log.type === 'error' 
                      ? 'text-rose-400 font-bold' 
                      : log.type === 'output' 
                        ? 'text-emerald-400' 
                        : log.type === 'security'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                  }`}
                >
                  <pre className="whitespace-pre-wrap">{log.text}</pre>
                </div>
              ))}
              {isRunning && (
                <div className="text-cyan-400 animate-pulse">
                  Ejecutando en hardware...
                </div>
              )}
            </div>

            {/* Custom Input (Validated against allowlist) */}
            <div className="flex items-center gap-2 pt-2">
              <span className="font-mono text-xs text-cyan-400">$ repairer probe</span>
              <input
                type="text"
                placeholder="Escriba probe catalogado..."
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customCommand) {
                    handleExecute(customCommand);
                    setCustomCommand('');
                  }
                }}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => {
                  if (customCommand) {
                    handleExecute(customCommand);
                    setCustomCommand('');
                  }
                }}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Command Audit Log */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          Registro de Auditoría de Comandos ADB Ejecutados ({adbAuditLogs.length})
        </h3>
        <div className="space-y-1.5 text-xs font-mono">
          {adbAuditLogs.map((log) => (
            <div key={log.id} className="p-2 rounded bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
              <div>
                <span className={log.result === 'PASS' ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                  [{log.result}]
                </span>{' '}
                <span className="text-white font-bold">{log.what}</span>{' '}
                <span className="text-slate-400">por {log.who.name} ({log.who.role})</span>
              </div>
              <span className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
