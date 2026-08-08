import React, { useEffect, useState, useCallback } from 'react';
import Modal from '../components/Modal';
import { getVentas, createVenta, updateVenta, getResumenDia, getClientes, buscarProductos } from '../api';

const METODOS_PAGO = ['efectivo', 'tarjeta', 'bizum'];
const ESTADOS = ['pagado', 'pendiente'];

const METODO_LABEL = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', bizum: 'Bizum' };
const ESTADO_CONFIG = {
  pagado: 'bg-green-500/10 text-green-400 border-green-500/20',
  pendiente: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

const LINEA_VACIA = { tipo: 'servicio', producto_id: '', descripcion: '', cantidad: 1, precio_unitario: '', subtotal: 0 };

function EstadoBadge({ estado }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ESTADO_CONFIG[estado] || ESTADO_CONFIG.pendiente}`}>
      {estado === 'pagado' ? 'Pagado' : 'Pendiente'}
    </span>
  );
}

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumenDia, setResumenDia] = useState(null);
  const [filtros, setFiltros] = useState({ fecha_desde: '', fecha_hasta: '', estado: '' });
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form nueva venta
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  const [clienteOpciones, setClienteOpciones] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [lineas, setLineas] = useState([{ ...LINEA_VACIA }]);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [estadoVenta, setEstadoVenta] = useState('pagado');
  const [notasVenta, setNotasVenta] = useState('');
  const [productosOpciones, setProductosOpciones] = useState([]);
  const [productoQuery, setProductoQuery] = useState('');

  const hoy = new Date().toISOString().split('T')[0];

  const cargarVentas = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
    if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;
    if (filtros.estado) params.estado = filtros.estado;
    getVentas(params)
      .then((res) => setVentas(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filtros]);

  useEffect(() => { cargarVentas(); }, [cargarVentas]);

  useEffect(() => {
    getResumenDia(hoy).then((res) => setResumenDia(res.data)).catch(console.error);
  }, [hoy]);

  useEffect(() => {
    if (clienteBusqueda.trim().length >= 2) {
      getClientes(clienteBusqueda).then((res) => setClienteOpciones(res.data)).catch(() => setClienteOpciones([]));
    } else {
      setClienteOpciones([]);
    }
  }, [clienteBusqueda]);

  useEffect(() => {
    if (productoQuery.trim().length >= 2) {
      buscarProductos(productoQuery).then((res) => setProductosOpciones(res.data)).catch(() => setProductosOpciones([]));
    } else {
      setProductosOpciones([]);
    }
  }, [productoQuery]);

  const totalVenta = lineas.reduce((sum, l) => sum + (Number(l.precio_unitario) * Number(l.cantidad) || 0), 0);

  const actualizarLinea = (idx, campo, valor) => {
    const nuevas = [...lineas];
    nuevas[idx] = { ...nuevas[idx], [campo]: valor };
    if (campo === 'precio_unitario' || campo === 'cantidad') {
      nuevas[idx].subtotal = Number(nuevas[idx].precio_unitario) * Number(nuevas[idx].cantidad);
    }
    setLineas(nuevas);
  };

  const seleccionarProductoEnLinea = (idx, producto) => {
    const nuevas = [...lineas];
    nuevas[idx] = {
      ...nuevas[idx],
      tipo: 'producto',
      producto_id: producto.id,
      descripcion: producto.nombre,
      precio_unitario: producto.precio_venta || '',
      subtotal: Number(producto.precio_venta || 0) * Number(nuevas[idx].cantidad),
    };
    setLineas(nuevas);
    setProductosOpciones([]);
    setProductoQuery('');
  };

  const abrirCrear = () => {
    setEditando(null);
    setLineas([{ ...LINEA_VACIA }]);
    setClienteSeleccionado(null);
    setClienteBusqueda('');
    setMetodoPago('efectivo');
    setEstadoVenta('pagado');
    setNotasVenta('');
    setError('');
    setModal(true);
  };

  const abrirEditar = (v) => {
    setEditando(v);
    setError('');
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editando) {
        await updateVenta(editando.id, { estado: estadoVenta, metodo_pago: metodoPago, notas: notasVenta });
      } else {
        const lineasValidas = lineas.filter((l) => l.descripcion && l.precio_unitario);
        if (lineasValidas.length === 0) { setError('Añade al menos una línea'); setSaving(false); return; }
        const data = {
          cliente_id: clienteSeleccionado?.id || null,
          fecha: hoy,
          subtotal: totalVenta,
          total: totalVenta,
          metodo_pago: metodoPago,
          estado: estadoVenta,
          notas: notasVenta,
          lineas: lineasValidas.map((l) => ({
            tipo: l.tipo,
            producto_id: l.producto_id || null,
            descripcion: l.descripcion,
            cantidad: Number(l.cantidad),
            precio_unitario: Number(l.precio_unitario),
            subtotal: Number(l.precio_unitario) * Number(l.cantidad),
          })),
        };
        await createVenta(data);
      }
      setModal(false);
      cargarVentas();
      getResumenDia(hoy).then((res) => setResumenDia(res.data)).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-white">Ventas</h1>
        <button
          onClick={abrirCrear}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nueva venta
        </button>
      </div>

      {/* Resumen del día */}
      {resumenDia && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total hoy', value: `${Number(resumenDia.total || 0).toFixed(2)} €`, color: 'text-green-400' },
            { label: 'Efectivo', value: `${Number(resumenDia.efectivo || 0).toFixed(2)} €`, color: 'text-gray-300' },
            { label: 'Tarjeta', value: `${Number(resumenDia.tarjeta || 0).toFixed(2)} €`, color: 'text-gray-300' },
            { label: 'Bizum', value: `${Number(resumenDia.bizum || 0).toFixed(2)} €`, color: 'text-gray-300' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 rounded-xl px-4 py-3">
              <p className="text-gray-500 text-xs">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <input type="date" value={filtros.fecha_desde}
          onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
        <input type="date" value={filtros.fecha_hasta}
          onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
        <select value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500">
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
        </select>
        {(filtros.fecha_desde || filtros.fecha_hasta || filtros.estado) && (
          <button onClick={() => setFiltros({ fecha_desde: '', fecha_hasta: '', estado: '' })}
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
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden sm:table-cell">Cliente</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Total</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Pago</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Estado</th>
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
              ) : ventas.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No hay ventas</td></tr>
              ) : (
                ventas.map((v) => (
                  <tr key={v.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-gray-300">
                      {new Date(v.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-gray-300 hidden sm:table-cell">
                      {v.cliente_nombre || <span className="text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">
                      {Number(v.total).toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {METODO_LABEL[v.metodo_pago] || v.metodo_pago}
                    </td>
                    <td className="px-4 py-3"><EstadoBadge estado={v.estado} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => abrirEditar(v)}
                        className="text-xs text-gray-400 hover:text-white font-medium">
                        Editar
                      </button>
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
        title={editando ? 'Editar venta' : 'Nueva venta'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

          {editando ? (
            <div className="space-y-3">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Estado</label>
                <select value={estadoVenta || editando.estado}
                  onChange={(e) => setEstadoVenta(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                  {ESTADOS.map((e) => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Método de pago</label>
                <select value={metodoPago || editando.metodo_pago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                  {METODOS_PAGO.map((m) => <option key={m} value={m}>{METODO_LABEL[m]}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <>
              {/* Buscar cliente */}
              <div className="relative">
                <label className="block text-gray-400 text-xs mb-1">Cliente (opcional)</label>
                <input value={clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellidos}` : clienteBusqueda}
                  onChange={(e) => { setClienteBusqueda(e.target.value); setClienteSeleccionado(null); }}
                  placeholder="Buscar cliente..."
                  className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
                {clienteOpciones.length > 0 && !clienteSeleccionado && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                    {clienteOpciones.map((c) => (
                      <button key={c.id} type="button"
                        onClick={() => { setClienteSeleccionado(c); setClienteOpciones([]); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        {c.nombre} {c.apellidos}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Líneas */}
              <div className="space-y-2">
                <p className="text-gray-400 text-xs font-medium">Líneas de venta</p>
                {lineas.map((linea, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-3 space-y-2">
                    <div className="flex gap-2">
                      <select value={linea.tipo}
                        onChange={(e) => actualizarLinea(idx, 'tipo', e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1 focus:outline-none">
                        <option value="servicio">Servicio</option>
                        <option value="producto">Producto</option>
                      </select>
                      {linea.tipo === 'producto' && (
                        <div className="relative flex-1">
                          <input
                            value={linea.descripcion || productoQuery}
                            onChange={(e) => { setProductoQuery(e.target.value); actualizarLinea(idx, 'descripcion', e.target.value); actualizarLinea(idx, 'producto_id', ''); }}
                            placeholder="Buscar producto..."
                            className="w-full bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500" />
                          {productosOpciones.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-xl">
                              {productosOpciones.map((p) => (
                                <button key={p.id} type="button"
                                  onClick={() => seleccionarProductoEnLinea(idx, p)}
                                  className="w-full text-left px-2 py-1.5 text-xs text-gray-300 hover:bg-gray-700">
                                  {p.nombre} — {Number(p.precio_venta || 0).toFixed(2)} €
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {linea.tipo === 'servicio' && (
                        <input value={linea.descripcion}
                          onChange={(e) => actualizarLinea(idx, 'descripcion', e.target.value)}
                          placeholder="Descripción del servicio"
                          className="flex-1 bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input type="number" min="1" value={linea.cantidad}
                        onChange={(e) => actualizarLinea(idx, 'cantidad', e.target.value)}
                        placeholder="Cant."
                        className="w-20 bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1 focus:outline-none" />
                      <input type="number" step="0.01" min="0" value={linea.precio_unitario}
                        onChange={(e) => actualizarLinea(idx, 'precio_unitario', e.target.value)}
                        placeholder="Precio €"
                        className="flex-1 bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1 focus:outline-none" />
                      <span className="text-gray-400 text-xs flex items-center w-16 text-right">
                        {(Number(linea.precio_unitario) * Number(linea.cantidad) || 0).toFixed(2)} €
                      </span>
                      {lineas.length > 1 && (
                        <button type="button" onClick={() => setLineas(lineas.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300 text-xs px-1">✕</button>
                      )}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setLineas([...lineas, { ...LINEA_VACIA }])}
                  className="text-indigo-400 hover:text-indigo-300 text-xs font-medium">
                  + Añadir línea
                </button>
              </div>

              <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2">
                <span className="text-gray-400 text-sm">Total</span>
                <span className="text-white font-bold text-lg">{totalVenta.toFixed(2)} €</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Método de pago</label>
                  <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                    {METODOS_PAGO.map((m) => <option key={m} value={m}>{METODO_LABEL[m]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Estado</label>
                  <select value={estadoVenta} onChange={(e) => setEstadoVenta(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                    {ESTADOS.map((e) => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1">Notas</label>
                <textarea value={notasVenta} onChange={(e) => setNotasVenta(e.target.value)} rows={2}
                  className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
              </div>
            </>
          )}

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
