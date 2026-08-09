import React, { useState, useEffect } from 'react';
import { getClientes, buscarProductos, createVenta, createCliente, getArticulosTpv, deleteArticuloTpv } from '../api';
import TicketImprimible from '../components/TicketImprimible';
import FacturaImprimible from '../components/FacturaImprimible';
import Modal from '../components/Modal';
import ModalCrearArticuloTpv from '../components/ModalCrearArticuloTpv';

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
  const [articulosTpv, setArticulosTpv] = useState([]);
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
  const [ultimaVenta, setUltimaVenta] = useState(null);
  const [formatoImpresion, setFormatoImpresion] = useState(null);
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [nuevoClienteForm, setNuevoClienteForm] = useState({ nombre: '', apellidos: '', telefono: '', email: '' });
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  useEffect(() => {
    cargarProductos();
    cargarArticulosTpv();
  }, [ultimaVenta]); // recargar productos cuando se cierra el ticket (por stock)

  const cargarProductos = async () => {
    try {
      const res = await buscarProductos('');
      setProductos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarArticulosTpv = async () => {
    try {
      const res = await getArticulosTpv();
      setArticulosTpv(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (dropdownVisible) {
      const delay = setTimeout(() => {
        getClientes(clienteBusqueda).then(res => setClienteOpciones(res.data)).catch(console.error);
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [clienteBusqueda, dropdownVisible]);

  const handleCreateCliente = async (e) => {
    e.preventDefault();
    try {
      const res = await createCliente(nuevoClienteForm);
      setClienteSeleccionado(res.data);
      setShowModalCliente(false);
      setNuevoClienteForm({ nombre: '', apellidos: '', telefono: '', email: '' });
      setClienteBusqueda('');
      setDropdownVisible(false);
    } catch (err) {
      alert('Error al crear el cliente: ' + (err.response?.data?.error || err.message));
    }
  };

  const articulosTpvFiltrados = articulosTpv.filter(p => {
    const matchCat = categoriaSeleccionada === 'todos' || p.categoria === categoriaSeleccionada;
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusqueda;
  });

  const [modalArticulo, setModalArticulo] = useState(false);
  const [articuloEdit, setArticuloEdit] = useState(null);

  const handleEliminarArticuloTpv = async (e, id) => {
    e.stopPropagation(); // Evitar añadir al carrito
    if (!window.confirm('¿Seguro que deseas eliminar este artículo del TPV?')) return;
    try {
      await deleteArticuloTpv(id);
      cargarArticulosTpv();
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEditarArticuloTpv = (e, art) => {
    e.stopPropagation(); // Evitar añadir al carrito
    setArticuloEdit(art);
    setModalArticulo(true);
  };
  const [opcionesArticuloActivo, setOpcionesArticuloActivo] = useState(null); // Para modal de opciones
  const [extrasSeleccionados, setExtrasSeleccionados] = useState({});

  const agregarAlCarritoBase = (articulo, extras = []) => {
    const extrasCost = extras.reduce((sum, ext) => sum + Number(ext.coste), 0);
    const precioFinal = Number(articulo.precio_base) + extrasCost;
    let descExtras = extras.length > 0 ? ` (+ ${extras.map(e => e.nombre).join(', ')})` : '';

    const existenteIdx = lineas.findIndex(l => l.articulo_tpv_id === articulo.id && l.precio_unitario == precioFinal && l.descripcion === articulo.nombre + descExtras);
    if (existenteIdx >= 0) {
      const nuevas = [...lineas];
      nuevas[existenteIdx].cantidad += 1;
      setLineas(nuevas);
    } else {
      setLineas([...lineas, {
        tipo: articulo.producto_id ? 'producto' : 'servicio',
        producto_id: articulo.producto_id,
        articulo_tpv_id: articulo.id,
        descripcion: articulo.nombre + descExtras,
        cantidad: 1,
        precio_unitario: precioFinal,
        impuesto_porcentaje: 21,
        descuento_porcentaje: 0
      }]);
    }
  };

  const agregarAlCarrito = (articulo) => {
    if (articulo.producto_id) {
      const stock = Number(articulo.stock_actual);
      if (stock <= 0) {
        alert(`No puedes añadir "${articulo.nombre}" porque el stock es ${stock} (Agotado).`);
        return;
      }
      if (stock <= 5) {
        if (!window.confirm(`El producto "${articulo.nombre}" tiene stock bajo (Quedan ${stock}). ¿Deseas añadirlo de todos modos?`)) {
          return;
        }
      }
    }
    
    // Si tiene opciones, mostrar el modal de opciones
    if (articulo.opciones && articulo.opciones.length > 0) {
      setOpcionesArticuloActivo(articulo);
      setExtrasSeleccionados({});
      return;
    }

    agregarAlCarritoBase(articulo, []);
  };

  const confirmarExtras = () => {
    if (!opcionesArticuloActivo) return;
    const extrasToAdd = opcionesArticuloActivo.opciones.filter((opt, idx) => extrasSeleccionados[idx]);
    agregarAlCarritoBase(opcionesArticuloActivo, extrasToAdd);
    setOpcionesArticuloActivo(null);
    setExtrasSeleccionados({});
  };

  const agregarServicioCustom = () => {
    setLineas([...lineas, {
      tipo: 'servicio',
      producto_id: null,
      descripcion: 'Servicio personalizado',
      cantidad: 1,
      precio_unitario: 0,
      impuesto_porcentaje: 21,
      descuento_porcentaje: 0
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

  // Cálculos
  let totalSubtotal = 0; // Base imponible
  let totalImpuestos = 0;
  let totalDescuentosValor = 0; // Solo para mostrar info
  
  const lineasCalculadas = lineas.map(l => {
    const puConIva = Number(l.precio_unitario) || 0;
    const qty = Number(l.cantidad) || 0;
    const desc = Number(l.descuento_porcentaje) || 0;
    const imp = 21; // IVA fijo del 21% a todo
    
    const baseLine = puConIva * qty;
    const descValue = baseLine * (desc / 100);
    const totalLineaFinal = baseLine - descValue; // Lo que paga el cliente finalmente
    
    // Desglosar la base imponible (sin IVA) a partir del total final
    const baseImponible = totalLineaFinal / (1 + imp / 100);
    const taxValue = totalLineaFinal - baseImponible;
    
    totalSubtotal += baseImponible;
    totalImpuestos += taxValue;
    totalDescuentosValor += descValue;
    
    return { ...l, impuesto_porcentaje: imp, subtotal: totalLineaFinal };
  });

  const total = totalSubtotal + totalImpuestos;

  const handleCobrar = async () => {
    if (lineas.length === 0) return alert('El ticket está vacío');
    setSaving(true);
    try {
      const payload = {
        cliente_id: clienteSeleccionado?.id || null,
        fecha: new Date().toISOString().split('T')[0],
        subtotal: totalSubtotal,
        impuestos: totalImpuestos,
        descuentos: totalDescuentosValor,
        total,
        metodo_pago: metodoPago,
        estado: 'pagado',
        notas,
        lineas: lineasCalculadas
      };
      const res = await createVenta(payload);
      
      // Mostrar ticket
      if (res.data) {
        // Enriquecer datos para el ticket
        const ventaParaTicket = {
          ...res.data,
          cliente_nombre: clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellidos}` : null,
          lineas: lineasCalculadas
        };
        setUltimaVenta(ventaParaTicket);
      }
      
      // Limpiar ticket
      setLineas([]);
      setClienteSeleccionado(null);
      setClienteBusqueda('');
      setNotas('');
      if (onVentaCreada) onVentaCreada();
    } catch (err) {
      alert('Error al crear la venta');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ModalCrearArticuloTpv 
        isOpen={modalArticulo} 
        onClose={() => setModalArticulo(false)} 
        onSave={cargarArticulosTpv} 
      />

      {opcionesArticuloActivo && (
        <Modal isOpen={true} onClose={() => setOpcionesArticuloActivo(null)} title={`Opciones para ${opcionesArticuloActivo.nombre}`} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-300">Selecciona los extras a aplicar:</p>
            {opcionesArticuloActivo.opciones.map((opt, idx) => (
              <label key={idx} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition">
                <input 
                  type="checkbox" 
                  checked={!!extrasSeleccionados[idx]}
                  onChange={(e) => setExtrasSeleccionados({...extrasSeleccionados, [idx]: e.target.checked})}
                  className="w-5 h-5 text-indigo-500 rounded focus:ring-indigo-500 bg-gray-900 border-gray-700"
                />
                <span className="text-white flex-1">{opt.nombre}</span>
                <span className="text-gray-400 font-bold">+{Number(opt.coste).toFixed(2)}€</span>
              </label>
            ))}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <button type="button" onClick={() => setOpcionesArticuloActivo(null)} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700">Cancelar</button>
              <button type="button" onClick={confirmarExtras} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Añadir al ticket</button>
            </div>
          </div>
        </Modal>
      )}

      <Modal isOpen={!!ultimaVenta && !formatoImpresion} onClose={() => setUltimaVenta(null)} title="Venta Completada">
        <div className="text-center p-6 space-y-6">
          <div className="text-emerald-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white">¡Cobro realizado con éxito!</h3>
          <p className="text-gray-400">La venta se ha guardado correctamente. ¿Deseas imprimir comprobante?</p>
          
          <div className="flex justify-center gap-4 pt-4">
            <button onClick={() => setFormatoImpresion('ticket')} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2">
               Ticket (80mm)
            </button>
            <button onClick={() => setFormatoImpresion('factura')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2">
               Factura (A4)
            </button>
          </div>
          
          <div className="mt-8">
            <button onClick={() => setUltimaVenta(null)} className="text-gray-500 hover:text-white underline text-sm">
              Cerrar y nueva venta
            </button>
          </div>
        </div>
      </Modal>

      {formatoImpresion === 'ticket' && ultimaVenta && (
        <TicketImprimible venta={ultimaVenta} onClose={() => { setFormatoImpresion(null); setUltimaVenta(null); }} />
      )}
      {formatoImpresion === 'factura' && ultimaVenta && (
        <FacturaImprimible venta={ultimaVenta} onClose={() => { setFormatoImpresion(null); setUltimaVenta(null); }} />
      )}
      
      <div className="flex flex-col md:flex-row h-full min-h-[750px] bg-gray-950 rounded-xl overflow-hidden shadow-xl border border-gray-800">
        {/* PANEL IZQUIERDO: CATÁLOGO */}
        <div className="flex-1 flex flex-col p-6 border-r border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Catálogo TPV</h2>
            <div className="flex items-center gap-4">
              <div className="w-64 relative">
                <input 
                  type="text" 
                  placeholder="Buscar artículo..." 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <svg className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button 
                onClick={() => { setArticuloEdit(null); setModalArticulo(true); }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition"
              >
                + Nuevo Artículo
              </button>
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
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))' }}>
              {articulosTpvFiltrados.map(art => (
                <div key={art.id} className="relative group aspect-square">
                  <button 
                    onClick={() => agregarAlCarrito(art)}
                    className={`w-full h-full rounded-xl border-2 border-transparent hover:border-white/20 flex flex-col items-center justify-center gap-1.5 p-1.5 transition-all shadow-md overflow-hidden relative
                      ${art.color === 'gray' ? 'bg-gray-700 text-gray-200' : ''}
                      ${art.color === 'indigo' ? 'bg-indigo-600 text-white' : ''}
                      ${art.color === 'emerald' ? 'bg-emerald-500 text-white' : ''}
                      ${art.color === 'rose' ? 'bg-rose-500 text-white' : ''}
                      ${art.color === 'amber' ? 'bg-amber-500 text-white' : ''}
                      ${art.color === 'cyan' ? 'bg-cyan-500 text-white' : ''}
                    `}
                  >
                    {art.producto_id && (
                      <div className={`absolute top-0 right-0 px-1.5 py-0.5 text-[9px] font-bold rounded-bl-lg ${Number(art.stock_actual) <= 0 ? 'bg-red-500 text-white' : 'bg-black/30 text-white'}`}>
                        Stock: {art.stock_actual}
                      </div>
                    )}
                    {art.opciones && art.opciones.length > 0 && (
                       <div className="absolute bottom-0 right-0 px-1.5 py-0.5 text-[9px] font-bold bg-black/30 text-white rounded-tl-lg" title="Tiene opciones extra">
                         + Extras
                       </div>
                    )}
                    <div className="w-8 h-8 shrink-0 opacity-90 transition-transform group-hover:scale-110 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {art.icono === 'cube' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />}
                        {art.icono === 'sparkles' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />}
                        {art.icono === 'beaker' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />}
                        {art.icono === 'star' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />}
                        {art.icono === 'heart' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />}
                        {art.icono === 'lightning-bolt' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                        {art.icono === 'scissors' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />}
                        {art.icono === 'color-swatch' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />}
                        {!['cube', 'sparkles', 'beaker', 'star', 'heart', 'lightning-bolt', 'scissors', 'color-swatch'].includes(art.icono) && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
                      </svg>
                    </div>
                    <div className="w-full text-center">
                      <div className="text-[11px] leading-tight font-bold line-clamp-2 px-0.5 break-words mb-0.5" title={art.nombre}>{art.nombre}</div>
                      <div className="text-[10px] opacity-80 font-medium">{Number(art.precio_base || 0).toFixed(2)} €</div>
                    </div>
                  </button>

                  {/* Acciones de edición (solo visibles al pasar el ratón en escritorio, en móvil siempre visibles o con otro control) */}
                  <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleEditarArticuloTpv(e, art)} className="bg-black/50 hover:bg-black p-1.5 rounded text-white shadow-sm" title="Editar">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={(e) => handleEliminarArticuloTpv(e, art.id)} className="bg-black/50 hover:bg-red-600 p-1.5 rounded text-white shadow-sm" title="Eliminar">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {articulosTpvFiltrados.length === 0 && (
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
        <div className="w-full md:w-[450px] bg-gray-900 flex flex-col shadow-2xl z-10 border-l border-gray-800">
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
                onChange={(e) => { setClienteBusqueda(e.target.value); setClienteSeleccionado(null); setDropdownVisible(true); }}
                onFocus={() => setDropdownVisible(true)}
                onBlur={() => setTimeout(() => setDropdownVisible(false), 200)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {clienteSeleccionado && (
                <button onClick={() => setClienteSeleccionado(null)} className="absolute right-2 top-2 text-gray-400 hover:text-white">✕</button>
              )}
              {dropdownVisible && !clienteSeleccionado && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                  {clienteOpciones.map(c => (
                    <button key={c.id} onClick={() => { setClienteSeleccionado(c); setClienteOpciones([]); setClienteBusqueda(''); setDropdownVisible(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 border-b border-gray-700/50 last:border-0">
                      <div className="font-medium text-white">{c.nombre} {c.apellidos}</div>
                      <div className="text-xs text-gray-500">{c.telefono || c.email}</div>
                    </button>
                  ))}
                  <button onMouseDown={(e) => { e.preventDefault(); setShowModalCliente(true); setDropdownVisible(false); }} className="w-full text-left px-3 py-2 text-sm text-indigo-400 hover:bg-gray-700 font-medium">
                    + Crear nuevo cliente
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Líneas */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {lineasCalculadas.map((linea, idx) => (
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
                
                <div className="flex flex-wrap items-center justify-between gap-3">
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
                  
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 mb-1">Precio Base</span>
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          step="0.01" 
                          value={linea.precio_unitario} 
                          onChange={(e) => actualizarLinea(idx, 'precio_unitario', e.target.value)}
                          className="w-16 text-right bg-gray-900 rounded border border-gray-700 text-white text-xs py-1 px-1 focus:outline-none focus:border-indigo-500" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 mb-1">% Dto</span>
                      <input 
                        type="number" 
                        value={linea.descuento_porcentaje} 
                        onChange={(e) => actualizarLinea(idx, 'descuento_porcentaje', e.target.value)}
                        className="w-12 text-center bg-gray-900 rounded border border-gray-700 text-white text-xs py-1 px-1 focus:outline-none focus:border-indigo-500" 
                      />
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 mb-1">% IVA</span>
                      <select 
                        value="21"
                        disabled
                        className="bg-gray-900 rounded border border-gray-700 text-gray-400 text-xs py-1 px-1 focus:outline-none appearance-none opacity-80 cursor-not-allowed"
                      >
                        <option value="21">21% (Inc)</option>
                      </select>
                    </div>

                    <div className="flex flex-col items-end min-w-[50px]">
                      <span className="text-[10px] text-gray-500 mb-1">Total</span>
                      <span className="text-white text-sm font-bold">{Number(linea.subtotal).toFixed(2)}€</span>
                    </div>
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
          <div className="p-4 bg-gray-800/50 border-t border-gray-800 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-400">Subtotal (Base)</span>
              <span className="text-gray-300">{totalSubtotal.toFixed(2)} €</span>
            </div>
            {totalDescuentosValor > 0 && (
              <div className="flex justify-between mb-1 text-emerald-400">
                <span>Descuentos</span>
                <span>-{totalDescuentosValor.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between mb-3 border-b border-gray-700 pb-3">
              <span className="text-gray-400">Impuestos (IVA)</span>
              <span className="text-gray-300">{totalImpuestos.toFixed(2)} €</span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-300 font-bold">TOTAL</span>
              <span className="text-3xl font-black text-white">{total.toFixed(2)} €</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {METODOS_PAGO.map(m => (
                <button 
                  key={m}
                  onClick={() => setMetodoPago(m)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors border ${
                    metodoPago === m ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {METODO_LABEL[m]}
                </button>
              ))}
            </div>

            <button 
              onClick={handleCobrar}
              disabled={saving || lineas.length === 0}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-indigo-500/50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Cobrar e Imprimir</>
              )}
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={showModalCliente} onClose={() => setShowModalCliente(false)} title="Nuevo Cliente" maxWidth="max-w-md">
        <form onSubmit={handleCreateCliente} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
            <input required value={nuevoClienteForm.nombre} onChange={e => setNuevoClienteForm({...nuevoClienteForm, nombre: e.target.value})} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Apellidos *</label>
            <input required value={nuevoClienteForm.apellidos} onChange={e => setNuevoClienteForm({...nuevoClienteForm, apellidos: e.target.value})} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Teléfono</label>
            <input value={nuevoClienteForm.telefono} onChange={e => setNuevoClienteForm({...nuevoClienteForm, telefono: e.target.value})} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Email</label>
            <input type="email" value={nuevoClienteForm.email} onChange={e => setNuevoClienteForm({...nuevoClienteForm, email: e.target.value})} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModalCliente(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">Crear</button>
          </div>
        </form>
      </Modal>

      <ModalCrearArticuloTpv 
        isOpen={modalArticulo} 
        onClose={() => setModalArticulo(false)} 
        onSave={() => { setModalArticulo(false); cargarArticulosTpv(); }} 
        articuloEdicion={articuloEdit} 
      />
    </>
  );
}
