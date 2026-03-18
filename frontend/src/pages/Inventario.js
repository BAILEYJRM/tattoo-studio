import React, { useEffect, useState, useRef, useCallback } from 'react';
import Modal from '../components/Modal';
import {
  getProductos, buscarProductos, createProducto, updateProducto,
  getMovimientos, registrarMovimiento,
} from '../api';

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

const FORM_VACIO = {
  sku: '', nombre: '', descripcion: '', categoria: 'otros', codigo_barras: '',
  precio_compra: '', precio_venta: '', stock_actual: 0, stock_minimo: 0,
  lote: '', fecha_caducidad: '', proveedor: '',
};

const MOV_VACIO = { tipo: 'entrada', cantidad: 1, motivo: 'compra', notas: '' };
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

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [modalProducto, setModalProducto] = useState(false);
  const [modalMovimiento, setModalMovimiento] = useState(false);
  const [modalQR, setModalQR] = useState(false);
  const [editando, setEditando] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [movForm, setMovForm] = useState(MOV_VACIO);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const qrRef = useRef(null);
  const scannerRef = useRef(null);

  const cargarProductos = useCallback(() => {
    setLoading(true);
    getProductos()
      .then((res) => setProductos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (busqueda.trim().length >= 2) {
        buscarProductos(busqueda).then((res) => setProductos(res.data)).catch(console.error);
      } else if (busqueda.trim() === '') {
        cargarProductos();
      }
    }, 400);
    return () => clearTimeout(t);
  }, [busqueda, cargarProductos]);

  // QR Scanner
  useEffect(() => {
    if (!modalQR) {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            setBusqueda(decodedText);
            setModalQR(false);
          },
          () => {}
        );
      } catch (e) {
        console.error('QR error:', e);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [modalQR]);

  const productosFiltrados = productos.filter((p) =>
    !categoriaFiltro || p.categoria === categoriaFiltro
  );

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setError('');
    setModalProducto(true);
  };

  const abrirEditar = (p) => {
    setEditando(p);
    setForm({
      sku: p.sku || '', nombre: p.nombre || '', descripcion: p.descripcion || '',
      categoria: p.categoria || 'otros', codigo_barras: p.codigo_barras || '',
      precio_compra: p.precio_compra || '', precio_venta: p.precio_venta || '',
      stock_actual: p.stock_actual || 0, stock_minimo: p.stock_minimo || 0,
      lote: p.lote || '',
      fecha_caducidad: p.fecha_caducidad ? p.fecha_caducidad.split('T')[0] : '',
      proveedor: p.proveedor || '',
    });
    setError('');
    setModalProducto(true);
  };

  const abrirMovimiento = async (p) => {
    setProductoSeleccionado(p);
    setMovForm(MOV_VACIO);
    setError('');
    const res = await getMovimientos({ producto_id: p.id }).catch(() => ({ data: [] }));
    setMovimientos(res.data);
    setModalMovimiento(true);
  };

  const handleSubmitProducto = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editando) {
        await updateProducto(editando.id, form);
      } else {
        await createProducto(form);
      }
      setModalProducto(false);
      cargarProductos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitMovimiento = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await registrarMovimiento({ ...movForm, producto_id: productoSeleccionado.id });
      const res = await getMovimientos({ producto_id: productoSeleccionado.id });
      setMovimientos(res.data);
      setMovForm(MOV_VACIO);
      cargarProductos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-white">Inventario</h1>
        <button
          onClick={abrirCrear}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo producto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, SKU o código de barras..."
            className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={() => setModalQR(true)}
          className="bg-gray-900 border border-gray-700 hover:border-indigo-500 text-gray-300 hover:text-white text-sm px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          title="Escanear código de barras"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5V16M3 8V5a1 1 0 011-1h3M3 16v3a1 1 0 001 1h3m10-14h3a1 1 0 011 1v3" />
          </svg>
          Escanear
        </button>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500"
        >
          {CATEGORIAS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Nombre</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden sm:table-cell">SKU</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Categoría</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Stock</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden lg:table-cell">Caducidad</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">P. Venta</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-4 bg-gray-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    No hay productos
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((p) => (
                  <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{p.nombre}</p>
                      {p.proveedor && <p className="text-gray-500 text-xs">{p.proveedor}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {CATEGORIA_LABELS[p.categoria] || p.categoria}
                    </td>
                    <td className="px-4 py-3">
                      <StockBadge stock={p.stock_actual} minimo={p.stock_minimo} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs">
                      {p.fecha_caducidad
                        ? new Date(p.fecha_caducidad).toLocaleDateString('es-ES')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-300 hidden md:table-cell">
                      {p.precio_venta ? `${Number(p.precio_venta).toFixed(2)} €` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => abrirMovimiento(p)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          Stock
                        </button>
                        <button
                          onClick={() => abrirEditar(p)}
                          className="text-xs text-gray-400 hover:text-white font-medium"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Producto */}
      <Modal isOpen={modalProducto} onClose={() => setModalProducto(false)}
        title={editando ? 'Editar producto' : 'Nuevo producto'}>
        <form onSubmit={handleSubmitProducto} className="space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">SKU *</label>
              <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Código de barras</label>
              <input value={form.codigo_barras} onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Nombre *</label>
            <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={2}
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Categoría *</label>
            <select required value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
              {CATEGORIAS.slice(1).map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Precio compra (€)</label>
              <input type="number" step="0.01" min="0" value={form.precio_compra}
                onChange={(e) => setForm({ ...form, precio_compra: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Precio venta (€)</label>
              <input type="number" step="0.01" min="0" value={form.precio_venta}
                onChange={(e) => setForm({ ...form, precio_venta: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Stock actual</label>
              <input type="number" min="0" value={form.stock_actual}
                onChange={(e) => setForm({ ...form, stock_actual: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Stock mínimo</label>
              <input type="number" min="0" value={form.stock_minimo}
                onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Lote</label>
              <input value={form.lote} onChange={(e) => setForm({ ...form, lote: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Fecha caducidad</label>
              <input type="date" value={form.fecha_caducidad}
                onChange={(e) => setForm({ ...form, fecha_caducidad: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Proveedor</label>
            <input value={form.proveedor} onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalProducto(false)}
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

      {/* Modal Movimiento */}
      <Modal isOpen={modalMovimiento} onClose={() => setModalMovimiento(false)}
        title={`Stock: ${productoSeleccionado?.nombre}`}>
        <div className="space-y-5">
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <form onSubmit={handleSubmitMovimiento} className="space-y-3 bg-gray-800 rounded-lg p-4">
            <p className="text-white text-sm font-medium">Registrar movimiento</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Tipo</label>
                <select value={movForm.tipo}
                  onChange={(e) => setMovForm({ ...movForm, tipo: e.target.value, motivo: MOTIVOS[e.target.value][0] })}
                  className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="ajuste">Ajuste</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Cantidad</label>
                <input type="number" min="1" required value={movForm.cantidad}
                  onChange={(e) => setMovForm({ ...movForm, cantidad: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Motivo</label>
              <select value={movForm.motivo}
                onChange={(e) => setMovForm({ ...movForm, motivo: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                {(MOTIVOS[movForm.tipo] || []).map((m) => (
                  <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Notas</label>
              <input value={movForm.notas} onChange={(e) => setMovForm({ ...movForm, notas: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
            <button type="submit" disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors">
              {saving ? 'Registrando…' : 'Registrar'}
            </button>
          </form>

          {/* Historial */}
          <div>
            <p className="text-gray-400 text-xs font-medium mb-2">Historial reciente</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {movimientos.length === 0 ? (
                <p className="text-gray-600 text-xs text-center py-4">Sin movimientos</p>
              ) : (
                movimientos.slice(0, 20).map((m) => (
                  <div key={m.id} className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2">
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                      m.tipo === 'entrada' ? 'bg-green-500/15 text-green-400'
                      : m.tipo === 'salida' ? 'bg-red-500/15 text-red-400'
                      : 'bg-yellow-500/15 text-yellow-400'
                    }`}>
                      {m.tipo === 'entrada' ? '+' : m.tipo === 'salida' ? '-' : '~'}{m.cantidad}
                    </span>
                    <span className="text-gray-400 text-xs flex-1">{m.motivo?.replace(/_/g, ' ')}</span>
                    <span className="text-gray-600 text-xs">
                      {new Date(m.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal QR Scanner */}
      <Modal isOpen={modalQR} onClose={() => setModalQR(false)} title="Escanear código de barras">
        <div className="space-y-4">
          <div id="qr-reader" ref={qrRef} className="w-full rounded-lg overflow-hidden bg-black min-h-[250px]" />
          <p className="text-gray-500 text-xs text-center">Apunta la cámara al código de barras del producto</p>
          <button onClick={() => setModalQR(false)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
}
