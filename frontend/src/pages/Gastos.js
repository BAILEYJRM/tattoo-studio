import React, { useEffect, useState, useCallback } from 'react';
import Modal from '../components/Modal';
import { getGastos, createGasto, updateGasto, deleteGasto, getResumenMesGastos, getProductos } from '../api';

const TIPOS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'inversion', label: 'Inversión' },
  { value: 'sesion', label: 'Sesión' },
  { value: 'fijo', label: 'Fijo' },
];

const CATEGORIAS = [
  { value: 'material', label: 'Material' },
  { value: 'alquiler', label: 'Alquiler' },
  { value: 'suministros', label: 'Suministros' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'otros', label: 'Otros' },
];

const TIPO_CONFIG = {
  inversion: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  sesion: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  fijo: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const FORM_VACIO = {
  fecha: new Date().toISOString().split('T')[0],
  concepto: '', tipo: 'fijo', categoria: 'otros',
  importe: '', proveedor: '', producto_id: '', notas: '',
  agregar_inventario: false, cantidad_inventario: 1,
};

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [filtros, setFiltros] = useState({ tipo: '', fecha_desde: '', fecha_hasta: '' });
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [productos, setProductos] = useState([]);

  const mesActual = new Date();
  const year = mesActual.getFullYear();
  const month = mesActual.getMonth() + 1;
  const mesLabel = mesActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const cargarGastos = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filtros.tipo) params.tipo = filtros.tipo;
    if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
    if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;
    getGastos(params)
      .then((res) => setGastos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filtros]);

  useEffect(() => { cargarGastos(); }, [cargarGastos]);

  useEffect(() => {
    getResumenMesGastos(year, month).then((res) => setResumen(res.data)).catch(console.error);
    getProductos().then((res) => setProductos(res.data)).catch(console.error);
  }, [year, month]);

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setError('');
    setModal(true);
  };

  const abrirEditar = (g) => {
    setEditando(g);
    setForm({
      fecha: g.fecha ? g.fecha.split('T')[0] : '',
      concepto: g.concepto || '', tipo: g.tipo || 'fijo',
      categoria: g.categoria || 'otros', importe: g.importe || '',
      proveedor: g.proveedor || '', producto_id: g.producto_id || '',
      notas: g.notas || '', agregar_inventario: false, cantidad_inventario: 1,
    });
    setError('');
    setModal(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    await deleteGasto(id).catch(console.error);
    cargarGastos();
    getResumenMesGastos(year, month).then((res) => setResumen(res.data)).catch(console.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editando) {
        await updateGasto(editando.id, form);
      } else {
        await createGasto(form);
      }
      setModal(false);
      cargarGastos();
      getResumenMesGastos(year, month).then((res) => setResumen(res.data)).catch(console.error);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // Calcular totales por categoría del resumen
  const totalMes = resumen ? Number(resumen.total || 0) : 0;
  const desglose = resumen?.desglose || [];
  const porCategoria = CATEGORIAS.map((c) => ({
    ...c,
    total: desglose.filter((d) => d.categoria === c.value).reduce((s, d) => s + Number(d.total), 0),
  })).filter((c) => c.total > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-white">Gastos</h1>
        <button
          onClick={abrirCrear}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo gasto
        </button>
      </div>

      {/* Resumen mensual */}
      <div className="bg-gray-900 rounded-xl p-5">
        <p className="text-gray-400 text-sm mb-3">Resumen — {mesLabel}</p>
        <div className="flex items-end gap-6 flex-wrap">
          <div>
            <p className="text-gray-500 text-xs">Total gastos</p>
            <p className="text-white text-2xl font-bold">{totalMes.toFixed(2)} €</p>
          </div>
          {porCategoria.map((c) => (
            <div key={c.value}>
              <p className="text-gray-500 text-xs">{c.label}</p>
              <p className="text-gray-300 text-sm font-semibold">{c.total.toFixed(2)} €</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <select value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500">
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input type="date" value={filtros.fecha_desde}
          onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
        <input type="date" value={filtros.fecha_hasta}
          onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
        {(filtros.tipo || filtros.fecha_desde || filtros.fecha_hasta) && (
          <button onClick={() => setFiltros({ tipo: '', fecha_desde: '', fecha_hasta: '' })}
            className="text-sm text-gray-400 hover:text-white">
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Fecha</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Concepto</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden sm:table-cell">Tipo</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Categoría</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Importe</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 bg-gray-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : gastos.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No hay gastos</td></tr>
              ) : (
                gastos.map((g) => (
                  <tr key={g.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-gray-300 text-xs">
                      {new Date(g.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white">{g.concepto}</p>
                      {g.proveedor && <p className="text-gray-500 text-xs">{g.proveedor}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TIPO_CONFIG[g.tipo] || TIPO_CONFIG.fijo}`}>
                        {g.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                      {CATEGORIAS.find((c) => c.value === g.categoria)?.label || g.categoria}
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">
                      {Number(g.importe).toFixed(2)} €
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => abrirEditar(g)}
                          className="text-xs text-gray-400 hover:text-white font-medium">Editar</button>
                        <button onClick={() => handleEliminar(g.id)}
                          className="text-xs text-red-400 hover:text-red-300 font-medium">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)}
        title={editando ? 'Editar gasto' : 'Nuevo gasto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Fecha *</label>
              <input type="date" required value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Importe (€) *</label>
              <input type="number" step="0.01" min="0" required value={form.importe}
                onChange={(e) => setForm({ ...form, importe: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1">Concepto *</label>
            <input required value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Tipo *</label>
              <select required value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                {TIPOS.slice(1).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Categoría</label>
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1">Proveedor</label>
            <input value={form.proveedor} onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
          </div>

          {form.tipo === 'inversion' && (
            <div className="bg-gray-800 rounded-lg p-3 space-y-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="agregar_inv" checked={form.agregar_inventario}
                  onChange={(e) => setForm({ ...form, agregar_inventario: e.target.checked })}
                  className="rounded border-gray-600 bg-gray-700 text-indigo-500" />
                <label htmlFor="agregar_inv" className="text-gray-300 text-sm">Añadir al inventario</label>
              </div>
              {form.agregar_inventario && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Producto</label>
                    <select value={form.producto_id}
                      onChange={(e) => setForm({ ...form, producto_id: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                      <option value="">Seleccionar...</option>
                      {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Cantidad</label>
                    <input type="number" min="1" value={form.cantidad_inventario}
                      onChange={(e) => setForm({ ...form, cantidad_inventario: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-xs mb-1">Notas</label>
            <textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} rows={2}
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
