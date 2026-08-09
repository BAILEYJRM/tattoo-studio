import React, { useState, useEffect } from 'react';
import { getClientes, buscarProductos, createVenta } from '../api';

const CATEGORIAS_TPV = [
  { id: 'todos', label: 'Todos' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'piercings_joyeria', label: 'Piercing/Joyería' },
  { id: 'otros', label: 'Otros' }
];

const METODOS_PAGO = ['efectivo', 'tarjeta', 'bizum'];
const METODO_LABEL = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', bizum: 'Bizum' };

export default function Tpv({ onVentaCreada }) {
  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  
  // Ticket / Carrito
  const [lineas, setLineas] = useState([]);
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  const [clienteOpciones, setClienteOpciones] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [notas, setNotas] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await buscarProductos('');
      setProductos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (clienteBusqueda.length > 2 && !clienteSeleccionado) {
      const delay = setTimeout(() => {
        getClientes(clienteBusqueda).then(res => setClienteOpciones(res.data)).catch(console.error);
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [clienteBusqueda, clienteSeleccionado]);

  // Filtrado de productos para el panel izquierdo
  const productosFiltrados = productos.filter(p => {
    const matchCat = categoriaSeleccionada === 'todos' || 
                    (categoriaSeleccionada === 'servicios' && p.categoria === 'servicio') ||
                    p.categoria === categoriaSeleccionada;
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(busqueda.toLowerCase()));
    return matchCat && matchBusqueda;
  });

  // Funciones del Carrito
  const agregarAlCarrito = (prod) => {
    const existenteIdx = lineas.findIndex(l => l.producto_id === prod.id && l.precio_unitario == prod.precio_venta);
    if (existenteIdx >= 0) {
      const nuevas = [...lineas];
      nuevas[existenteIdx].cantidad += 1;
      setLineas(nuevas);
    } else {
      setLineas([...lineas, {
        tipo: prod.categoria === 'servicio' ? 'servicio' : 'producto',
        producto_id: prod.id,
        descripcion: prod.nombre,
        cantidad: 1,
        precio_unitario: prod.precio_venta || 0
      }]);
    }
  };

  const agregarServicioCustom = () => {
    setLineas([...lineas, {
      tipo: 'servicio',
      producto_id: null,
      descripcion: 'Servicio personalizado',
      cantidad: 1,
      precio_unitario: 0
    }]);
  };

  const actualizarLinea = (idx, campo, valor) => {
    const nuevas = [...lineas];
    nuevas[idx][campo] = valor;
    setLineas(nuevas);
  };

  const eliminarLinea = (idx) => {
    setLineas(lineas.filter((_, i) => i !== idx));
  };

  const total = lineas.reduce((acc, l) => acc + (Number(l.precio_unitario) * Number(l.cantidad) || 0), 0);

  const handleCobrar = async () => {
    if (lineas.length === 0) return alert('El ticket está vacío');
    setSaving(true);
    try {
      await createVenta({
        cliente_id: clienteSeleccionado?.id || null,
        fecha: new Date().toISOString().split('T')[0],
        total,
        metodo_pago: metodoPago,
        estado: 'pagado',
        notas,
        lineas
      });
      if (onVentaCreada) onVentaCreada();
    } catch (err) {
      alert('Error al crear la venta');
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[600px] bg-gray-950 rounded-xl overflow-hidden shadow-xl border border-gray-800">
      {/* PANEL IZQUIERDO: CATÁLOGO */}
      <div className="flex-1 flex flex-col p-6 border-r border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Catálogo TPV</h2>
          <div className="w-64 relative">
            <input 
              type="text" 
              placeholder="Buscar o escanear código..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <svg className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Categorías */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
          {CATEGORIAS_TPV.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setCategoriaSeleccionada(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                categoriaSeleccionada === cat.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <button 
            onClick={agregarServicioCustom}
            className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors ml-auto"
          >
            + Servicio Libre
          </button>
        </div>

        {/* Rejilla de productos */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {productosFiltrados.map(prod => (
              <button 
                key={prod.id}
                onClick={() => agregarAlCarrito(prod)}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-indigo-500 transition-colors group aspect-square"
              >
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-3 group-hover:bg-indigo-600/20 transition-colors">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="text-gray-300 text-sm font-medium line-clamp-2 mb-1">{prod.nombre}</span>
                <span className="text-white font-bold">{Number(prod.precio_venta || 0).toFixed(2)} €</span>
              </button>
            ))}
          </div>
          {productosFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p>No se encontraron productos en esta categoría</p>
            </div>
          )}
        </div>
      </div>

      {/* PANEL DERECHO: TICKET */}
      <div className="w-full md:w-96 bg-gray-900 flex flex-col shadow-2xl z-10 border-l border-gray-800">
        <div className="p-4 border-b border-gray-800 bg-gray-800/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ticket
          </h2>
        </div>

        {/* Buscador de Cliente */}
        <div className="p-4 border-b border-gray-800 relative z-20">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Asociar cliente (opcional)..." 
              value={clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellidos}` : clienteBusqueda}
              onChange={(e) => { setClienteBusqueda(e.target.value); setClienteSeleccionado(null); }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {clienteSeleccionado && (
              <button onClick={() => setClienteSeleccionado(null)} className="absolute right-2 top-2 text-gray-400 hover:text-white">✕</button>
            )}
            {clienteOpciones.length > 0 && !clienteSeleccionado && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                {clienteOpciones.map(c => (
                  <button key={c.id} onClick={() => { setClienteSeleccionado(c); setClienteOpciones([]); setClienteBusqueda(''); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 border-b border-gray-700/50 last:border-0">
                    <div className="font-medium text-white">{c.nombre} {c.apellidos}</div>
                    <div className="text-xs text-gray-500">{c.telefono || c.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lista de Líneas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {lineas.map((linea, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-3 border border-gray-700 relative group">
              <button onClick={() => eliminarLinea(idx)} className="absolute -top-2 -right-2 bg-gray-700 hover:bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg text-xs">✕</button>
              
              <div className="mb-2">
                <input 
                  type="text" 
                  value={linea.descripcion} 
                  onChange={(e) => actualizarLinea(idx, 'descripcion', e.target.value)}
                  className="w-full bg-transparent text-white text-sm font-medium focus:outline-none focus:border-b focus:border-indigo-500 px-1 placeholder-gray-500" 
                  placeholder="Descripción"
                />
              </div>
              
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-700">
                  <button onClick={() => actualizarLinea(idx, 'cantidad', Math.max(1, Number(linea.cantidad) - 1))} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">-</button>
                  <input 
                    type="number" 
                    value={linea.cantidad} 
                    onChange={(e) => actualizarLinea(idx, 'cantidad', e.target.value)}
                    className="w-10 text-center bg-transparent text-white text-sm font-medium focus:outline-none appearance-none" 
                  />
                  <button onClick={() => actualizarLinea(idx, 'cantidad', Number(linea.cantidad) + 1)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">+</button>
                </div>
                
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    step="0.01" 
                    value={linea.precio_unitario} 
                    onChange={(e) => actualizarLinea(idx, 'precio_unitario', e.target.value)}
                    className="w-20 text-right bg-transparent text-white text-sm font-medium focus:outline-none focus:border-b focus:border-indigo-500 px-1" 
                  />
                  <span className="text-gray-400 text-sm">€</span>
                </div>
              </div>
            </div>
          ))}
          {lineas.length === 0 && (
            <div className="h-full flex items-center justify-center text-center p-6 text-gray-500">
              <p className="text-sm">El ticket está vacío.<br/>Selecciona productos o servicios a la izquierda.</p>
            </div>
          )}
        </div>

        {/* Resumen y Cobro */}
        <div className="p-4 bg-gray-800/50 border-t border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium">Subtotal</span>
            <span className="text-2xl font-bold text-white">{total.toFixed(2)} €</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {METODOS_PAGO.map(m => (
              <button 
                key={m}
                onClick={() => setMetodoPago(m)}
                className={`py-2 rounded-lg text-sm font-medium transition-colors border ${
                  metodoPago === m ? 'bg-indigo-600' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                }`}
              >
                {METODO_LABEL[m]}
              </button>
            ))}
          </div>

          <button 
            onClick={handleCobrar}
            disabled={saving || lineas.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Cobrar {total.toFixed(2)} €</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
