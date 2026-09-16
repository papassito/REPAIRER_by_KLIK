import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Eye, 
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { useRepairer } from '../../context/RepairerContext';
import { RepairOrderStatus } from '../../types/repairer';

interface OrderListProps {
  onSelectOrder: (id: string) => void;
  onOpenNewReception: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  onSelectOrder,
  onOpenNewReception,
  searchTerm,
  setSearchTerm
}) => {
  const { orders } = useRepairer();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deviceSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.intakeReason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: RepairOrderStatus) => {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white font-display">
            SESIONES DE MANTENIMIENTO ACTIVAS (WINDOWS TARGETS)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Trazabilidad inmutable de todas las observaciones, planes, ledgers y compensaciones de la sucursal.
          </p>
        </div>

        <button
          onClick={onOpenNewReception}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo Escaneo de Target Windows
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Orden, Cliente o Modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono">Estado:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white font-mono cursor-pointer"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="RECEIVED">RECEIVED (Recepción)</option>
            <option value="INSPECTION">INSPECTION (Check-In)</option>
            <option value="DIAGNOSING">DIAGNOSING (Diagnóstico)</option>
            <option value="ESTIMATE_PENDING">ESTIMATE_PENDING</option>
            <option value="WAITING_APPROVAL">WAITING_APPROVAL</option>
            <option value="APPROVED">APPROVED (Autorizado)</option>
            <option value="IN_REPAIR">IN_REPAIR (Reparación)</option>
            <option value="QUALITY_CONTROL">QUALITY_CONTROL (QC)</option>
            <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
            <option value="DELIVERED">DELIVERED (Entregado)</option>
            <option value="CLOSED">CLOSED (Cerrado)</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white font-mono cursor-pointer"
          >
            <option value="ALL">Todas Prioridades</option>
            <option value="HIGH">ALTA</option>
            <option value="NORMAL">NORMAL</option>
            <option value="LOW">BAJA</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800/80 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Orden</th>
                <th className="py-3 px-4">Dispositivo</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Motivo / Falla</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Prioridad</th>
                <th className="py-3 px-4">Técnico</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => onSelectOrder(order.id)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {order.deviceSummary}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {order.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      "{order.intakeReason}"
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        order.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {order.assignedTechnicianName || 'Sin asignar'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(order.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                        title="Ver ciclo de vida completo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                    No se encontraron órdenes que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
