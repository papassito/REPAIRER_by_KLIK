import React from 'react';
import { 
  Wrench, 
  Cpu, 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  Award, 
  UserCheck
} from 'lucide-react';
import { useRepairer } from '../../context/RepairerContext';
import { UserRole } from '../../types/repairer';

interface NavbarProps {
  onOpenE2ECertification: () => void;
  onOpenNewReception: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenE2ECertification, 
  onOpenNewReception,
  searchTerm,
  setSearchTerm
}) => {
  const { 
    currentUser, 
    setCurrentUserRole, 
    deviceConnectionState, 
    connectedDevice,
    resetDatabase 
  } = useRepairer();

  const getDeviceBadge = () => {
    switch (deviceConnectionState) {
      case 'ADB_READY':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          text: `ADB LISTO: ${connectedDevice ? connectedDevice.model : 'Android'}`
        };
      case 'USB_DETECTED':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400 animate-pulse',
          text: 'USB DETECTADO (Handshake...)'
        };
      case 'ADB_UNAUTHORIZED':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400 animate-ping',
          text: 'ADB NO AUTORIZADO (Revisar pantalla)'
        };
      case 'DIAGNOSTIC_SESSION':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-400 animate-pulse',
          text: 'SESIÓN DE DIAGNÓSTICO EN CURSO'
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-400 border-slate-700',
          dot: 'bg-slate-500',
          text: 'PUENTE ADB: DESCONECTADO'
        };
    }
  };

  const badge = getDeviceBadge();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Brand & System Vision */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 font-display font-bold text-lg">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg tracking-wider text-white">
              REPAIRER
            </span>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              by KLIK
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight hidden sm:inline">
              OS v2.6.4-ENTERPRISE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-none">
            Sistema Operativo para Talleres de Dispositivos Electrónicos
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por IMEI, Serie, Cliente, Modelo u Orden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Actions & Status Badges */}
      <div className="flex items-center gap-2.5">
        {/* ADB Bridge Status Badge */}
        <div className={`hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-mono font-medium ${badge.bg}`}>
          <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
          <Cpu className="w-3.5 h-3.5" />
          <span>{badge.text}</span>
        </div>

        {/* E2E Master Certification Runner Button */}
        <button
          onClick={onOpenE2ECertification}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          title="Ejecutar y certificar Caso Maestro E2E (Samsung A54 - 16 pasos)"
        >
          <Award className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Certificación E2E</span>
        </button>

        {/* Role Selector (Zero-Trust Simulation) */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 rounded-lg p-1">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
          <select
            value={currentUser.role}
            onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
            className="text-xs bg-transparent text-slate-300 font-medium py-0.5 px-1 rounded focus:outline-none focus:bg-slate-700 cursor-pointer"
            title="Cambiar rol operativo (Zero Trust)"
          >
            <option value="TECHNICIAN" className="bg-slate-800 text-white">Rol: Técnico Master</option>
            <option value="RECEPTION" className="bg-slate-800 text-white">Rol: Recepción / Intake</option>
            <option value="QC" className="bg-slate-800 text-white">Rol: Auditor QC</option>
            <option value="CASHIER" className="bg-slate-800 text-white">Rol: Caja / Entregas</option>
            <option value="ADMIN" className="bg-slate-800 text-white">Rol: Administrador</option>
            <option value="CUSTOMER" className="bg-slate-800 text-white">Rol: Cliente (Portal)</option>
          </select>
        </div>

        {/* Reset Database Button */}
        <button
          onClick={() => {
            if (confirm('¿Restablecer datos de demostración a su estado inicial de fábrica?')) {
              resetDatabase();
            }
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
          title="Restablecer base de datos inicial"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
