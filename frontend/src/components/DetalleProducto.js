import React, { useState } from 'react';

const CATEGORIAS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'tintas_pigmentos', label: 'Tintas y pigmentos' },
  { value: 'agujas_cartuchos', label: 'Agujas y cartuchos' },
  { value: 'piercings_joyeria', label: 'Piercings y joyería' },
  { value: 'cremas_cuidado', label: 'Cremas y cuidado' },
  { value: 'higiene', label: 'Higiene' },
  { value: 'otros', label: 'Otros' },
];
const CATEGORIA_LABELS = Object.fromEntries(CATEGORIAS.slice(1).map((c) => [c.value, c.label]));

const MOTIVOS = {
  entrada: ['compra', 'ajuste_manual'],
  salida: ['uso_sesion', 'venta', 'ajuste_manual'],
  ajuste: ['ajuste_manual'],
};

function StockBadge({ stock, minimo }) {
  const bajo = stock <= minimo;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
      bajo ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-green-500/15 text-green-400 border border-green-500/30'
    }`}>
      {bajo && <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />}
      {stock}
    </span>
  );
}

export default function DetalleProducto({ producto, movimientos, onClose, onEdit, setMovForm, movForm, error, saving, handleSubmitMovimiento }) {
  const [tab, setTab] = useState('datos');

  if (!producto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-center p-4 sm:p-6 overflow-y-auto" onClick={onClose}>
      <div className="bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col my-auto relative overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 px-5 py-4 flex items-center gap-4">
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-semibold text-lg truncate">{producto.nombre}</h1>
            <div className="flex items-center gap-2 mt-1">
              {producto.sku && <span className="text-gray-400 text-xs">{producto.sku}</span>}
              {producto.sku && <span className="text-gray-500 text-xs">·</span>}
              <StockBadge stock={producto.stock_actual} minimo={producto.stock_minimo} />
            </div>
          </div>
          <button onClick={() => onEdit(producto)} className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors shadow-sm whitespace-nowrap">
            Editar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-900 p-1 rounded-xl mb-5">
            {[
              { id: 'datos', label: 'Información' },
              { id: 'movimientos', label: 'Stock y Movimientos' }
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${tab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Datos ── */}
          {tab === 'datos' && (() => {
            const attributes = [];
            const otherDesc = [];
            if (producto.descripcion) {
              producto.descripcion.split('\n').forEach(line => {
                const match = line.match(/^([^:]+):\s*(.+)$/);
                if (match) {
                  attributes.push([match[1].trim(), match[2].trim()]);
                } else if (line.trim()) {
                  otherDesc.push(line);
                }
              });
            }

            const fields = [
              ['Nombre', producto.nombre],
              ['SKU', producto.sku],
              ['Categoría', CATEGORIA_LABELS[producto.categoria] || producto.categoria],
              ['Proveedor', producto.proveedor || '—'],
              ['Precio compra', producto.precio_compra ? `${Number(producto.precio_compra).toFixed(2)}€` : '—'],
              ['Precio venta', producto.precio_venta ? `${Number(producto.precio_venta).toFixed(2)}€` : '—'],
              ['Lote', producto.lote || '—'],
              ['Caducidad', producto.fecha_caducidad ? new Date(producto.fecha_caducidad).toLocaleDateString('es-ES') : '—'],
              ['Código de barras', producto.codigo_barras || '—'],
              ...attributes
            ];

            return (
              <div className="bg-gray-900 rounded-xl p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-sm">
                  {fields.map(([label, value], i) => (
                    <div key={`${label}-${i}`}>
                      <p className="text-gray-500 text-xs">{label}</p>
                      <p className="text-white mt-0.5 font-medium">{value}</p>
                    </div>
                  ))}
                </div>
                {otherDesc.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-800 rounded-xl border border-gray-700/50">
                    <p className="text-gray-500 text-xs font-medium mb-1.5">Descripción adicional</p>
                    <p className="text-gray-300 text-sm whitespace-pre-line">{otherDesc.join('\n')}</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Movimientos ── */}
          {tab === 'movimientos' && (
            <div className="space-y-6">
              <form onSubmit={handleSubmitMovimiento} className="space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-medium">Registrar movimiento rápido</p>
                  <StockBadge stock={producto.stock_actual} minimo={producto.stock_minimo} />
                </div>
                
                {error && <p className="text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">{error}</p>}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Tipo</label>
                    <select value={movForm.tipo}
                      onChange={(e) => setMovForm({ ...movForm, tipo: e.target.value, motivo: MOTIVOS[e.target.value][0] })}
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                      <option value="entrada">Entrada</option>
                      <option value="salida">Salida</option>
                      <option value="ajuste">Ajuste</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Cantidad</label>
                    <input type="number" min="1" required value={movForm.cantidad}
                      onChange={(e) => setMovForm({ ...movForm, cantidad: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Motivo</label>
                    <select value={movForm.motivo}
                      onChange={(e) => setMovForm({ ...movForm, motivo: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                      {(MOTIVOS[movForm.tipo] || []).map((m) => (
                        <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Notas</label>
                    <input value={movForm.notas} onChange={(e) => setMovForm({ ...movForm, notas: e.target.value })}
                      placeholder="Opcional..."
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <button type="submit" disabled={saving}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors mt-2">
                  {saving ? 'Registrando…' : 'Registrar movimiento'}
                </button>
              </form>

              <div>
                <p className="text-gray-400 text-xs font-medium mb-3">Historial de movimientos</p>
                <div className="space-y-2">
                  {movimientos.length === 0 ? (
                    <div className="bg-gray-900 rounded-xl p-8 text-center border border-gray-800">
                      <p className="text-gray-500 text-sm">Sin movimientos registrados</p>
                    </div>
                  ) : (
                    movimientos.map((m) => (
                      <div key={m.id} className="flex items-center justify-between gap-4 bg-gray-900 rounded-xl px-4 py-3 border border-gray-800 hover:border-gray-700 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className={`text-xs font-bold px-2 py-1 rounded-md flex-shrink-0 min-w-[36px] text-center ${
                            m.tipo === 'entrada' ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                            : m.tipo === 'salida' ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                            : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {m.tipo === 'entrada' ? '+' : m.tipo === 'salida' ? '-' : '~'}{m.cantidad}
                          </span>
                          <div className="min-w-0">
                            <p className="text-gray-300 text-sm truncate capitalize">{m.motivo?.replace(/_/g, ' ')}</p>
                            {m.notas && <p className="text-gray-500 text-xs truncate mt-0.5">{m.notas}</p>}
                          </div>
                        </div>
                        <span className="text-gray-500 text-xs flex-shrink-0 font-medium">
                          {new Date(m.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
