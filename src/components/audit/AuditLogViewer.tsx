import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Hash, 
  Clock, 
  User, 
  Terminal, 
  Lock, 
  CheckCircle2, 
  XCircle,
  FileCheck
} from 'lucide-react';
import { useRepairer } from '../../context/RepairerContext';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs } = useRepairer();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.what.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.who.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.repairOrderId && log.repairOrderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.hash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || log.actionType === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-white font-display">
              NÚCLEO DE AUDITORÍA INMUTABLE (APPEND-ONLY)
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              SHA-256 VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            "WHO, WHAT, WHEN, WHERE, WHY, RESULT. No se borra nada. No se edita nada. Solo se agregan registros."
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <Lock className="w-3.5 h-3.5" />
          <span>Cadena Criptográfica Íntegra ({auditLogs.length} bloques)</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por usuario, acción, orden o hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white font-mono cursor-pointer"
          >
            <option value="ALL">Todos los Tipos de Acción</option>
            <option value="ORDER_CREATE">ORDER_CREATE</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
            <option value="EVIDENCE_ADD">EVIDENCE_ADD</option>
            <option value="DIAGNOSTIC_RUN">DIAGNOSTIC_RUN</option>
            <option value="ESTIMATE_CREATE">ESTIMATE_CREATE</option>
            <option value="ESTIMATE_APPROVE">ESTIMATE_APPROVE</option>
            <option value="PART_CONSUME">PART_CONSUME</option>
            <option value="WORK_LOG_ADD">WORK_LOG_ADD</option>
            <option value="QC_COMPLETE">QC_COMPLETE</option>
            <option value="DELIVERY_COMPLETE">DELIVERY_COMPLETE</option>
            <option value="ADB_COMMAND">ADB_COMMAND</option>
            <option value="SECURITY_VIOLATION">SECURITY_VIOLATION</option>
          </select>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="space-y-3">
        {filteredLogs.map((log) => {
          const isViolation = log.actionType === 'SECURITY_VIOLATION';
          const isPass = log.result === 'PASS';
          return (
            <div 
              key={log.id} 
              className={`p-4 rounded-xl border text-xs space-y-3 ${
                isViolation 
                  ? 'bg-rose-950/20 border-rose-500/40' 
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              {/* Header line */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                    isViolation 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {log.actionType}
                  </span>
                  <span className="text-white font-bold text-sm">
                    {log.what}
                  </span>
                  {log.repairOrderId && (
                    <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      Orden: {log.repairOrderId}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isPass ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    RESULT: {log.result}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {new Date(log.timestamp).toISOString()}
                  </span>
                </div>
              </div>

              {/* 6 Questions Grid (Section 23) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-2 rounded bg-slate-800/40 border border-slate-700/40">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">WHO (Actor)</span>
                  <p className="font-semibold text-white mt-0.5">{log.who.name}</p>
                  <span className="text-[10px] font-mono text-cyan-400">Rol: {log.who.role}</span>
                </div>

                <div className="p-2 rounded bg-slate-800/40 border border-slate-700/40">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">WHERE (Terminal/IP)</span>
                  <p className="font-mono text-slate-300 mt-0.5">{log.where}</p>
                  <span className="text-[10px] text-slate-500">Sesión Verificada</span>
                </div>

                <div className="p-2 rounded bg-slate-800/40 border border-slate-700/40 md:col-span-2">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">WHY (Motivo Técnico)</span>
                  <p className="text-slate-300 mt-0.5 italic font-medium">{log.why}</p>
                </div>
              </div>

              {/* Payload Summary & Hash Footer */}
              <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                <div className="truncate max-w-xl">
                  <span className="text-slate-500">PAYLOAD: </span>
                  <span className="text-slate-300">{log.payloadSummary}</span>
                </div>

                <div className="flex items-center gap-1 text-cyan-400 shrink-0 bg-slate-950 px-2 py-1 rounded border border-slate-800" title={log.hash}>
                  <Hash className="w-3 h-3" />
                  <span className="tracking-wider">SHA-256: {log.hash.slice(0, 24)}...</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
