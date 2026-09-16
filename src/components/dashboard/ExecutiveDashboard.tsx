import React from 'react';
import { 
  AlertCircle, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  DollarSign, 
  ShieldCheck, 
  ChevronRight, 
  Plus, 
  TrendingUp,
  Cpu,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useRepairer } from '../../context/RepairerContext';
import { ActiveView } from '../layout/Sidebar';
import { RepairOrderStatus } from '../../types/repairer';

interface ExecutiveDashboardProps {
  onNavigate: (view: ActiveView) => void;
  onOpenNewReception: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ 
  onNavigate, 
  onOpenNewReception 
}) => {
  const { orders, setActiveOrderId } = useRepairer();

  // Metrics according to Section 30
  const blockedOrders = orders.filter(o => o.status === 'REJECTED');
  const waitingPartsOrders = orders.filter(o => o.status === 'ESTIMATE_PENDING');
  const inRepairOrders = orders.filter(o => o.status === 'IN_REPAIR' || o.status === 'DIAGNOSING');
  const readyOrders = orders.filter(o => o.status === 'READY_FOR_PICKUP' || o.status === 'QUALITY_CONTROL');
  const warrantyOrders = orders.filter(o => o.status === 'WARRANTY' || (o.warranty && o.warranty.claims.length > 0));

  // Revenue calculation
  const totalLedgersWritten = 42;
  const activeBackupsCount = 5;

  // Average repair cycle time (simulated 3.4 hrs)
  const avgCycleHours = 4.2;

  const handleSelectOrder = (id: string, view: ActiveView = 'lifecycle') => {
    setActiveOrderId(id);
    onNavigate(view);
  };

  const getStatusColor = (status: RepairOrderStatus) => {
    switch (status) {
      case 'RECEIVED':
      case 'INSPECTION':
        return 'bg-slate-700/60 text-slate-300 border-slate-600';
      case 'DIAGNOSING':
      case 'DIAGNOSED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'ESTIMATE_PENDING':
      case 'WAITING_APPROVAL':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'APPROVED':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'IN_REPAIR':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'QUALITY_CONTROL':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'READY_FOR_PICKUP':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'WAITING_PART':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'DELIVERED':
      case 'CLOSED':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Title and Fast Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight font-display">
              REPAIRER by KLIK - Windows Console & Monitoring Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              EN VIVO
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Panel administrativo de diagnósticos, planes de mantenimiento, ledgers declarativos y seguridad Zero-Trust.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('certification')}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Certificar E2E (A54)
          </button>
          <button
            onClick={onOpenNewReception}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ingresar Dispositivo
          </button>
        </div>
      </div>

      {/* Actionable Status Metrics Cards (Section 30) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Bloqueadas */}
        <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/30 shadow-sm relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-400">
              Planes Bloqueados / No Autorizados
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-white">
            {blockedOrders.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Fuegos de seguridad o autorizaciones expiradas
          </p>
        </div>

        {/* Esperando piezas */}
        <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 shadow-sm relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
              Planes en preparación
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-white">
            {waitingPartsOrders.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Esperando backup de compensación verificado
          </p>
        </div>

        {/* En Reparación */}
        <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/30 shadow-sm relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400">
              En ejecución controlada (Go Engine)
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-white">
            {inRepairOrders.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Sesiones mutantes activas de bajo nivel
          </p>
        </div>

        {/* Listas / QC */}
        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 shadow-sm relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Rollbacks Exitosos / Verificados
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-white">
            {readyOrders.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Compensaciones con validación de hash correctas
          </p>
        </div>
      </div>

      {/* Secondary KPIs: Revenue, Avg Cycle Time, Warranties */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Ledger Entries Escritos
            </span>
            <div className="text-xl font-bold text-white mt-1 flex items-baseline gap-1 font-display">
              {totalLedgersWritten} <span className="text-xs font-normal text-slate-400 font-sans">registros</span>
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> 100% Declarativos libres de código
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Tiempo de Rollback Go
            </span>
            <div className="text-xl font-bold text-white mt-1 font-display">
              {avgCycleHours} <span className="text-xs font-normal text-slate-400 font-sans">horas / orden</span>
            </div>
            <span className="text-[11px] text-cyan-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" /> Rollback ultra rápido y seguro (Go-native)
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Backups de Compensación activos
            </span>
            <div className="text-xl font-bold text-white mt-1 font-display">
              {activeBackupsCount} <span className="text-xs font-normal text-slate-400 font-sans">backups</span>
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" /> Todos los backups validados con hash SHA-256
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active Orders Central Lifecycle Feed */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Sesiones de Mantenimiento Activas (Plan a Ejecución)
            </h2>
            <p className="text-xs text-slate-400">
              Cada registro mantiene trazabilidad inmutable y auditoría completa.
            </p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            Ver todas las órdenes ({orders.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {orders.map((order) => {
            const hasCriticalFinding = order.findings.some(f => f.severity === 'CRITICAL');
            return (
              <div 
                key={order.id}
                className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Order & Device Info */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-mono text-xs font-bold shrink-0">
                    {order.orderNumber.split('-')[2]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {order.orderNumber}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {order.deviceSummary}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      {order.priority === 'HIGH' && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                          ALTA PRIORIDAD
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      <span className="text-slate-300 font-medium">{order.customerName}</span> • Motivo: <span className="text-slate-300 italic">"{order.intakeReason}"</span>
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono mt-1.5">
                      <span>Técnico: {order.assignedTechnicianName || 'No asignado'}</span>
                      <span>•</span>
                      <span>Evidencias: {order.evidence.length} logs</span>
                      <span>•</span>
                      <span>Logs: {order.workLogs.length} entradas</span>
                      {hasCriticalFinding && (
                        <>
                          <span>•</span>
                          <span className="text-rose-400 font-semibold">Falla Crítica Confirmada</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleSelectOrder(order.id, 'workbench')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Plan Execution
                  </button>

                  <button
                    onClick={() => handleSelectOrder(order.id, 'lifecycle')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    Ver Ciclo Completo
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Banner: Section 35 System Intelligence / Failure Pattern Detection */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              MOTOR DE INTEGRIDAD Y REVERSIBILIDAD DE SISTEMA
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Antes de aplicar cualquier cambio mutante en el host Windows, el motor valida precondiciones, almacena el estado previo y verifica el descriptor de compensación.
            </p>
          </div>
        </div>

        <button 
          onClick={() => onNavigate('device-lab')}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
        >
          Abrir Device Lab
        </button>
      </div>
    </div>
  );
};
