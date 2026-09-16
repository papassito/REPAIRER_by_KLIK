import React, { useState } from 'react';
import { 
  Boxes, 
  Search, 
  Plus, 
  AlertTriangle, 
  History, 
  DollarSign, 
  Layers, 
  ArrowUpRight, 
  ShieldCheck, 
  Tag
} from 'lucide-react';
import { useRepairer } from '../../context/RepairerContext';

export const InventoryManager: React.FC = () => {
  const { parts, stockMovements, currentUser } = useRepairer();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'movements'>('catalog');

  const filteredParts = parts.filter(p => 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.compatibleModels.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const lowStockCount = parts.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-white font-display">
              INVENTARIO & TRAZABILIDAD DE REFACCIONES
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              AUDITABLE (STOCK_MOVEMENT)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Control estricto de piezas por SKU, compatibilidad de modelos, trazabilidad de lote y costo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'catalog' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Catálogo de Piezas ({parts.length})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'movements' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Bitácora de Movimientos ({stockMovements.length})
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockCount > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Alerta de Reorden:</strong> Hay {lowStockCount} refacciones que han alcanzado o superado el umbral de stock mínimo.
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
            PEDIDO REQUERIDO
          </span>
        </div>
      )}

      {activeTab === 'catalog' ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por SKU, Nombre o Modelo Compatible (ej: A54)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Parts Table */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">SKU / Identificador</th>
                    <th className="py-3 px-4">Descripción de Refacción</th>
                    <th className="py-3 px-4">Compatibilidad</th>
                    <th className="py-3 px-4">Ubicación</th>
                    <th className="py-3 px-4 text-center">Stock Actual</th>
                    <th className="py-3 px-4 text-right">Costo</th>
                    <th className="py-3 px-4 text-right">Precio Venta</th>
                    <th className="py-3 px-4 text-center">Garantía</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredParts.map((part) => {
                    const isLow = part.stock <= part.minStock;
                    return (
                      <tr key={part.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                          {part.sku}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-white">{part.name}</p>
                          <span className="text-[10px] text-slate-400">Proveedor: {part.supplier}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {part.compatibleModels.map((m, i) => (
                              <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {part.locationBin}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                            isLow 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {part.stock} uds
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          ${part.cost.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          ${part.salePrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-400">
                          {part.warrantyDays} días
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Movements Table (Audit Trail) */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              Auditoría de Movimientos de Inventario (Sección 17 & 38)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Quién sacó qué pieza, para cuál orden, a qué hora y con qué justificación técnica.
            </p>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Tipo Movimiento</th>
                    <th className="py-3 px-4">SKU Pieza</th>
                    <th className="py-3 px-4 text-center">Cantidad</th>
                    <th className="py-3 px-4 text-center">Stock Prev / Nuevo</th>
                    <th className="py-3 px-4">Orden Relacionada</th>
                    <th className="py-3 px-4">Responsable</th>
                    <th className="py-3 px-4">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {stockMovements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {new Date(mov.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                        {mov.type}
                      </td>
                      <td className="py-3 px-4 font-mono text-white font-medium">
                        {mov.partSku}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-white">
                        {mov.quantity}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {mov.previousStock} → <strong className="text-cyan-400">{mov.newStock}</strong>
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-400">
                        {mov.repairOrderId ? mov.repairOrderId : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {mov.performedBy}
                      </td>
                      <td className="py-3 px-4 text-slate-400 italic">
                        {mov.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
