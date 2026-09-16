import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  PlusCircle, 
  Cpu, 
  Wrench, 
  Boxes, 
  CheckCircle2, 
  ShieldAlert, 
  Smartphone, 
  Award,
  ChevronRight
} from 'lucide-react';
import { useRepairer } from '../../context/RepairerContext';

export type ActiveView = 
  | 'dashboard'
  | 'orders'
  | 'lifecycle'
  | 'workbench'
  | 'device-lab'
  | 'inventory'
  | 'qc'
  | 'audit'
  | 'customer-portal'
  | 'certification';

interface SidebarProps {
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  onOpenNewReception: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setCurrentView,
  onOpenNewReception
}) => {
  const { orders, selectedOrder } = useRepairer();

  const inRepairCount = orders.filter(o => o.status === 'IN_REPAIR').length;
  const blockedCount = orders.filter(o => o.status === 'WAITING_PART' || o.status === 'WAITING_CLIENT').length;
  const qcCount = orders.filter(o => o.status === 'QUALITY_CONTROL').length;

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard Ejecutivo', 
      icon: LayoutDashboard,
      badge: null
    },
    { 
      id: 'orders', 
      label: 'Órdenes de Reparación', 
      icon: ClipboardList,
      badge: orders.length
    },
    { 
      id: 'workbench', 
      label: 'Workbench del Técnico', 
      icon: Wrench,
      badge: inRepairCount > 0 ? `${inRepairCount} act.` : null,
      highlight: true
    },
    { 
      id: 'device-lab', 
      label: 'Device Lab & ADB Bridge', 
      icon: Cpu,
      badge: 'Allowlist'
    },
    { 
      id: 'inventory', 
      label: 'Inventario & Refacciones', 
      icon: Boxes,
      badge: null
    },
    { 
      id: 'qc', 
      label: 'Control de Calidad (QC)', 
      icon: CheckCircle2,
      badge: qcCount > 0 ? qcCount : null
    },
    { 
      id: 'audit', 
      label: 'Auditoría & Trazabilidad', 
      icon: ShieldAlert,
      badge: 'ZeroTrust'
    },
    { 
      id: 'customer-portal', 
      label: 'Portal del Cliente', 
      icon: Smartphone,
      badge: 'Público'
    },
    { 
      id: 'certification', 
      label: 'Certificación E2E (Fase 52)', 
      icon: Award,
      badge: '16/16',
      accent: true
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/95 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-3 space-y-4 overflow-y-auto">
        {/* Quick New Intake Button */}
        <button
          onClick={onOpenNewReception}
          className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center justify-between shadow-lg shadow-cyan-500/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
            <span>Nueva Recepción</span>
          </div>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">Fase 2</span>
        </button>

        {/* Section: Main Menu */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-semibold font-mono uppercase tracking-wider text-slate-500">
            Módulos del Sistema
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (item.id === 'orders' && currentView === 'lifecycle');
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as ActiveView)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm' 
                      : item.accent
                        ? 'text-amber-400 hover:bg-amber-500/10 border border-amber-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : item.accent ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive 
                        ? 'bg-cyan-500/20 text-cyan-300' 
                        : item.accent
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Order Widget in Sidebar if selected */}
        {selectedOrder && (
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                Orden en Foco
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-cyan-500/20 text-cyan-300">
                {selectedOrder.orderNumber}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-white truncate">
                {selectedOrder.deviceSummary}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {selectedOrder.customerName}
              </p>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
              <span className="text-[10px] font-mono text-cyan-400">
                Estado: {selectedOrder.status}
              </span>
              <button
                onClick={() => setCurrentView('lifecycle')}
                className="text-[10px] font-semibold text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                Ver Ciclo <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer: Philosophy & Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>TRAZABILIDAD TOTAL</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            INMUTABLE
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          "Cada reparación debe poder reconstruirse completa de inicio a fin."
        </p>
      </div>
    </aside>
  );
};
