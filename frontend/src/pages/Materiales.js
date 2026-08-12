import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Modal from '../components/Modal';
import {
  getProductos, buscarProductos, createProducto, updateProducto, deleteProducto, bulkDeleteProductos,
  getMovimientos, registrarMovimiento,
} from '../api';
import BulkSelectionBar from '../components/BulkSelectionBar';
import DetalleProducto from '../components/DetalleProducto';

const CATEGORIAS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'cremas_cuidado', label: 'Cremas y cuidado' },
  { value: 'higiene', label: 'Higiene' },
  { value: 'otros', label: 'Otros' },
];

const CATEGORIA_LABELS = Object.fromEntries(CATEGORIAS.slice(1).map((c) => [c.value, c.label]));

const FORM_VACIO = {
  sku: '', nombre: '', descripcionExtra: '', categoria: 'otros', codigo_barras: '',
  precio_compra: '', precio_venta: '', stock_actual: 0, stock_minimo: 0,
  lote: '', fecha_caducidad: '', proveedor: '',
  color: '', material: '', medidas: '', formato: '', unidades: ''
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

export default function Materiales() {
  const { t } = useLanguage();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [modalProducto, setModalProducto] = useState(false);
  const [modalMovimiento, setModalMovimiento] = useState(false);
  const [modalQR, setModalQR] = useState(false);
  
  // Filtros Avanzados
  const [proveedorFiltro, setProveedorFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [caducidadFiltro, setCaducidadFiltro] = useState('');
  const [stockMin, setStockMin] = useState('');
  const [stockMax, setStockMax] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');

  const [editando, setEditando] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [movForm, setMovForm] = useState(MOV_VACIO);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const qrRef = useRef(null);
  const scannerRef = useRef(null);
  
  // Selección en masa
  const [selectedIds, setSelectedIds] = useState([]);
  const wasSearching = useRef(false);

  const cargarProductos = useCallback(() => {
    setLoading(true);
    getProductos()
      .then((res) => setProductos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Initial load
  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  // Search debounce
  useEffect(() => {
    if (busqueda.trim().length >= 2) {
      wasSearching.current = true;
      const t = setTimeout(() => {
        setLoading(true);
        buscarProductos(busqueda)
          .then((res) => setProductos(res.data))
          .catch(console.error)
          .finally(() => setLoading(false));
      }, 400);
      return () => clearTimeout(t);
    } else if (busqueda.trim() === '' && wasSearching.current) {
      wasSearching.current = false;
      const t = setTimeout(() => {
        cargarProductos();
      }, 400);
      return () => clearTimeout(t);
    }
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

  const proveedoresUnicos = [...new Set(productos.map(p => p.proveedor).filter(Boolean))].sort();

  const productosFiltrados = productos.filter((p) => {
    // Excluir categorías de otros módulos
    if (p.categoria === 'piercings_joyeria' || p.categoria === 'tintas_pigmentos' || p.categoria === 'agujas_cartuchos') return false;
    
    // Categoría y Proveedor
    if (categoriaFiltro && p.categoria !== categoriaFiltro) return false;
    if (proveedorFiltro && p.proveedor !== proveedorFiltro) return false;

    // Estado de Stock
    if (estadoFiltro === 'stock_bajo' && p.stock_actual > p.stock_minimo) return false;
    if (estadoFiltro === 'sin_stock' && p.stock_actual > 0) return false;
    if (estadoFiltro === 'ok' && p.stock_actual <= p.stock_minimo) return false;

    // Caducidad
    if (caducidadFiltro) {
      if (!p.fecha_caducidad) return false;
      const cad = new Date(p.fecha_caducidad);
      const hoy = new Date();
      const meses3 = new Date();
      meses3.setMonth(hoy.getMonth() + 3);

      if (caducidadFiltro === 'caducado' && cad >= hoy) return false;
      if (caducidadFiltro === 'proximo' && (cad < hoy || cad > meses3)) return false;
    }

    // Rangos de Stock
    if (stockMin !== '' && p.stock_actual < Number(stockMin)) return false;
    if (stockMax !== '' && p.stock_actual > Number(stockMax)) return false;

    // Rangos de Precio
    if (precioMin !== '' && Number(p.precio_venta) < Number(precioMin)) return false;
    if (precioMax !== '' && Number(p.precio_venta) > Number(precioMax)) return false;

    // Búsqueda local por si acaso (aunque hay debounce, ayuda a refinar resultados)
    if (busqueda && !p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) && !p.sku?.toLowerCase().includes(busqueda.toLowerCase())) {
        return false;
    }

    return true;
  });

  const exportarCSV = () => {
    const cabeceras = ['Producto', 'Categoría', 'SKU', 'Stock Actual', 'Stock Mínimo', 'Caducidad', 'Proveedor', 'Precio Venta'];
    const lineas = productosFiltrados.map(p => [
      p.nombre, p.categoria, p.sku, p.stock_actual, p.stock_minimo, 
      p.fecha_caducidad ? p.fecha_caducidad.split('T')[0] : '', 
      p.proveedor, p.precio_venta
    ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
    
    const csvContent = [cabeceras.join(','), ...lineas].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'inventario.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setError('');
    setModalProducto(true);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === productosFiltrados.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(productosFiltrados.map(p => p.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el producto ${p.nombre}?`)) return;
    try {
      await deleteProducto(p.id);
      cargarProductos();
      setSelectedIds(prev => prev.filter(x => x !== p.id));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`¿Eliminar ${selectedIds.length} productos?`)) return;
    try {
      await bulkDeleteProductos(selectedIds);
      cargarProductos();
      setSelectedIds([]);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  const abrirEditar = (p) => {
    setEditando(p);
    let color = '', material = '', medidas = '', formato = '', unidades = '', descripcionExtra = '';
    if (p.descripcion) {
      const extra = [];
      p.descripcion.split('\n').forEach(line => {
        const match = line.match(/^([^:]+):\s*(.+)$/);
        if (match) {
          const key = match[1].trim().toLowerCase();
          const val = match[2].trim();
          if (key === 'color') color = val;
          else if (key === 'material') material = val;
          else if (key === 'medidas') medidas = val;
          else if (key === 'formato') formato = val;
          else if (key === 'unidades') unidades = val;
          else extra.push(line);
        } else if (line.trim()) {
          extra.push(line);
        }
      });
      descripcionExtra = extra.join('\n');
    }

    setForm({
      sku: p.sku || '', nombre: p.nombre || '', descripcionExtra,
      categoria: p.categoria || 'otros', codigo_barras: p.codigo_barras || '',
      precio_compra: p.precio_compra || '', precio_venta: p.precio_venta || '',
      stock_actual: p.stock_actual || 0, stock_minimo: p.stock_minimo || 0,
      lote: p.lote || '',
      fecha_caducidad: p.fecha_caducidad ? p.fecha_caducidad.split('T')[0] : '',
      proveedor: p.proveedor || '',
      color, material, medidas, formato, unidades
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
      const descLines = [];
      if (form.color) descLines.push(`Color: ${form.color}`);
      if (form.material) descLines.push(`Material: ${form.material}`);
      if (form.medidas) descLines.push(`Medidas: ${form.medidas}`);
      if (form.formato) descLines.push(`Formato: ${form.formato}`);
      if (form.unidades) descLines.push(`Unidades: ${form.unidades}`);
      if (form.descripcionExtra) descLines.push(form.descripcionExtra);
      
      const payload = { ...form, descripcion: descLines.join('\n') };

      if (editando) {
        await updateProducto(editando.id, payload);
      } else {
        await createProducto(payload);
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
        <h1 className="text-2xl font-bold text-white">{t('materiales')}</h1>
        <button
          onClick={abrirCrear}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + {t('nuevo')}
        </button>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">{t('inventario')}</h1>
          <p className="text-gray-400 mt-1">{productosFiltrados.length} {t('productos')}</p>
        </div>
        <button onClick={abrirCrear} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('crear')}
        </button>
      </div>

      {/* Panel de Filtros */}
      <div className="bg-gray-800 border border-gray-700/60 shadow-lg rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="text-white font-bold text-lg">Filtros</h2>
          </div>
          <button onClick={exportarCSV} className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exportar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Fila 1 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buscar</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg className="w-4 h-4 absolute left-3 top-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Buscar producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-indigo-500" />
              </div>
              <button onClick={() => setModalQR(true)} title="Escanear QR" className="bg-gray-900 border border-gray-800 text-indigo-400 hover:text-indigo-300 px-3 py-2.5 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5V16M3 8V5a1 1 0 011-1h3M3 16v3a1 1 0 001 1h3m10-14h3a1 1 0 011 1v3" /></svg>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categorías</label>
            <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)} className="w-full bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500">
              {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Proveedores</label>
            <select value={proveedorFiltro} onChange={(e) => setProveedorFiltro(e.target.value)} className="w-full bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500">
              <option value="">Todos los proveedores</option>
              {proveedoresUnicos.map((p, i) => <option key={i} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Fila 2 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</label>
            <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} className="w-full bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500">
              <option value="">Todos los estados</option>
              <option value="ok">Stock OK</option>
              <option value="stock_bajo">Stock Bajo</option>
              <option value="sin_stock">Sin Stock</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Caducidad</label>
            <select value={caducidadFiltro} onChange={(e) => setCaducidadFiltro(e.target.value)} className="w-full bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500">
              <option value="">Cualquier fecha</option>
              <option value="proximo">Próximo a caducar (&lt;3 meses)</option>
              <option value="caducado">Caducado</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rango de Stock</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={stockMin} onChange={(e) => setStockMin(e.target.value)} className="w-1/2 bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
              <input type="number" placeholder="Max" value={stockMax} onChange={(e) => setStockMax(e.target.value)} className="w-1/2 bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          {/* Fila 3 */}
          <div className="flex flex-col gap-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rango de Precio (€)</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} className="w-1/2 bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
              <input type="number" placeholder="Max" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} className="w-1/2 bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox"
                    checked={productosFiltrados.length > 0 && selectedIds.length === productosFiltrados.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500" />
                </th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Nombre</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden sm:table-cell">SKU</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Categoría</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Stock</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden lg:table-cell">Caducidad</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">P. Venta</th>
                <th className="px-4 py-3 text-right text-gray-400 font-medium">Acciones</th>
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
                      <input type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500" />
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => abrirMovimiento(p)}>
                      <p className="text-white font-medium hover:text-indigo-400 transition-colors">{p.nombre}</p>
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
                          onClick={() => abrirMovimiento(p)} title="Ver Detalles"
                          className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button
                          onClick={() => abrirEditar(p)} title="Editar"
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(p)} title="Eliminar"
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Color</label>
              <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Material</label>
              <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Medidas</label>
              <input value={form.medidas} onChange={(e) => setForm({ ...form, medidas: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Formato</label>
              <input value={form.formato} onChange={(e) => setForm({ ...form, formato: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Unidades</label>
              <input value={form.unidades} onChange={(e) => setForm({ ...form, unidades: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Descripción adicional</label>
            <textarea value={form.descripcionExtra} onChange={(e) => setForm({ ...form, descripcionExtra: e.target.value })}
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

      {/* Modal Detalle Producto */}
      {modalMovimiento && productoSeleccionado && (
        <DetalleProducto
          producto={productoSeleccionado}
          movimientos={movimientos}
          onClose={() => setModalMovimiento(false)}
          onEdit={(p) => { setModalMovimiento(false); abrirEditar(p); }}
          setMovForm={setMovForm}
          movForm={movForm}
          error={error}
          saving={saving}
          handleSubmitMovimiento={handleSubmitMovimiento}
        />
      )}

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

      <BulkSelectionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onDelete={handleBulkDelete}
      />
    </div>
  );
}
