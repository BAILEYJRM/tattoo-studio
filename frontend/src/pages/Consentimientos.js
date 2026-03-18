import React, { useEffect, useState, useRef, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { getConsentimientos, getPlantillas, createConsentimiento, regenerarPdfConsentimiento, getPdfUrl, getClientes, enviarEmailConsentimiento } from '../api';

const TIPOS = [
  {
    value: 'tatuaje', label: 'Tatuaje',
    color: 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400',
    icon: '🎨',
  },
  {
    value: 'piercing', label: 'Piercing',
    color: 'bg-purple-600/20 border-purple-500/40 text-purple-400',
    icon: '💎',
  },
  {
    value: 'microblading', label: 'Microblading',
    color: 'bg-pink-600/20 border-pink-500/40 text-pink-400',
    icon: '✏️',
  },
  {
    value: 'laser', label: 'Eliminación láser',
    color: 'bg-orange-600/20 border-orange-500/40 text-orange-400',
    icon: '⚡',
  },
];

const TIPO_CONFIG = {
  tatuaje: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  piercing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  microblading: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  laser: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const DATOS_CLIENTE_VACIO = { nombre: '', dni: '', fecha_nacimiento: '', telefono: '' };

// ─── Paso 1: Tipo + datos del cliente ────────────────────────────────────────
function Paso1({ tipoSeleccionado, setTipoSeleccionado, modoCliente, setModoCliente,
  clienteBusqueda, setClienteBusqueda, clienteOpciones, setClienteOpciones, clienteSeleccionado, setClienteSeleccionado,
  datosManual, setDatosManual, onSiguiente }) {

  const valido = tipoSeleccionado && (
    clienteSeleccionado ||
    (datosManual.nombre.trim() && datosManual.dni.trim())
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-400 text-sm mb-3">Tipo de consentimiento</p>
        <div className="grid grid-cols-2 gap-3">
          {TIPOS.map((t) => (
            <button key={t.value} type="button"
              onClick={() => setTipoSeleccionado(t.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                tipoSeleccionado === t.value
                  ? `${t.color} border-current`
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-400'
              }`}>
              <span className="text-2xl">{t.icon}</span>
              <span className="text-sm font-semibold">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-gray-400 text-sm mb-3">Datos del firmante</p>
        <div className="flex gap-2 mb-4">
          <button type="button"
            onClick={() => { setModoCliente('buscar'); setClienteSeleccionado(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              modoCliente === 'buscar' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}>
            Buscar cliente
          </button>
          <button type="button"
            onClick={() => { setModoCliente('manual'); setClienteSeleccionado(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              modoCliente === 'manual' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}>
            Introducir manualmente
          </button>
        </div>

        {modoCliente === 'buscar' ? (
          <div className="relative">
            <input
              value={clienteSeleccionado
                ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellidos}`
                : clienteBusqueda}
              onChange={(e) => { setClienteBusqueda(e.target.value); setClienteSeleccionado(null); }}
              placeholder="Nombre o teléfono del cliente..."
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            />
            {clienteOpciones.length > 0 && !clienteSeleccionado && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                {clienteOpciones.map((c) => (
                  <button key={c.id} type="button"
                    onClick={() => { setClienteSeleccionado(c); setClienteOpciones([]); }}
                    className="w-full text-left px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-700 flex flex-col">
                    <span className="font-medium">{c.nombre} {c.apellidos}</span>
                    <span className="text-gray-500 text-xs">{c.telefono || c.email}</span>
                  </button>
                ))}
              </div>
            )}
            {clienteSeleccionado && (
              <div className="mt-2 bg-indigo-600/10 border border-indigo-500/30 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{clienteSeleccionado.nombre} {clienteSeleccionado.apellidos}</p>
                  <p className="text-indigo-400 text-xs">{clienteSeleccionado.telefono}</p>
                </div>
                <button type="button" onClick={() => { setClienteSeleccionado(null); setClienteBusqueda(''); }}
                  className="text-gray-500 hover:text-white text-xs">✕</button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Nombre completo *</label>
                <input value={datosManual.nombre}
                  onChange={(e) => setDatosManual({ ...datosManual, nombre: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">DNI / NIE *</label>
                <input value={datosManual.dni}
                  onChange={(e) => setDatosManual({ ...datosManual, dni: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Fecha de nacimiento</label>
                <input type="date" value={datosManual.fecha_nacimiento}
                  onChange={(e) => setDatosManual({ ...datosManual, fecha_nacimiento: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Teléfono</label>
                <input type="tel" value={datosManual.telefono}
                  onChange={(e) => setDatosManual({ ...datosManual, telefono: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      <button type="button" disabled={!valido} onClick={onSiguiente}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors">
        Siguiente →
      </button>
    </div>
  );
}

// ─── Paso 2: Texto del consentimiento ────────────────────────────────────────
function Paso2({ plantilla, onSiguiente, onAtras }) {
  const [leido, setLeido] = useState(false);

  return (
    <div className="space-y-4 flex flex-col" style={{ minHeight: 0 }}>
      <div className="bg-gray-800 rounded-xl p-4 overflow-y-auto" style={{ maxHeight: '55vh' }}>
        <h3 className="text-white font-bold text-sm mb-3">{plantilla?.nombre}</h3>
        <div className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-mono">
          {plantilla?.contenido}
        </div>
      </div>

      <label className="flex items-start gap-3 bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-4 cursor-pointer">
        <input type="checkbox" checked={leido} onChange={(e) => setLeido(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-500 flex-shrink-0" />
        <span className="text-gray-300 text-sm">
          He leído y comprendido íntegramente el texto del consentimiento informado y acepto todas sus condiciones de forma libre y voluntaria.
        </span>
      </label>

      <div className="flex gap-3">
        <button type="button" onClick={onAtras}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
          ← Atrás
        </button>
        <button type="button" disabled={!leido} onClick={onSiguiente}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
          Pasar a firmar →
        </button>
      </div>
    </div>
  );
}

// ─── Paso 3: Firma digital ────────────────────────────────────────────────────
function Paso3({ onFirmar, onAtras, saving, error }) {
  const sigRef = useRef(null);
  const [vacio, setVacio] = useState(true);
  const [orientacion, setOrientacion] = useState(window.innerWidth < window.innerHeight ? 'portrait' : 'landscape');

  useEffect(() => {
    const handler = () => {
      setOrientacion(window.innerWidth < window.innerHeight ? 'portrait' : 'landscape');
      // Redimensionar canvas al cambiar orientación
      if (sigRef.current) {
        const canvas = sigRef.current.getCanvas();
        const data = sigRef.current.toData();
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        sigRef.current.fromData(data);
      }
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleFirmar = () => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const firmaBase64 = sigRef.current.toDataURL('image/png');
      onFirmar(firmaBase64);
    }
  };

  const handleBorrar = () => {
    sigRef.current?.clear();
    setVacio(true);
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

      <div className="text-center">
        <p className="text-white font-semibold">Firma del consentimiento</p>
        <p className="text-gray-500 text-xs mt-1">Firma con tu dedo o stylus en el área de abajo</p>
        {orientacion === 'portrait' && (
          <p className="text-yellow-400 text-xs mt-1">
            💡 Gira el dispositivo horizontalmente para una mejor experiencia de firma
          </p>
        )}
      </div>

      {/* Canvas de firma */}
      <div className="relative bg-white rounded-2xl overflow-hidden border-4 border-indigo-500"
        style={{ height: '280px', touchAction: 'none' }}>
        <SignatureCanvas
          ref={sigRef}
          penColor="#1a1a2e"
          canvasProps={{
            className: 'w-full h-full',
            style: { width: '100%', height: '100%' },
          }}
          onBegin={() => setVacio(false)}
        />
        {vacio && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-base select-none">Firmar aquí</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onAtras} disabled={saving}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          ← Atrás
        </button>
        <button type="button" onClick={handleBorrar} disabled={saving}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          Borrar
        </button>
        <button type="button" onClick={handleFirmar}
          disabled={vacio || saving}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors">
          {saving ? 'Procesando…' : '✓ Firmar y guardar'}
        </button>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function Consentimientos() {
  const [consentimientos, setConsentimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [paso, setPaso] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(null);
  const [regenerando, setRegenerando] = useState(null); // id del consentimiento en proceso
  const [enviandoEmail, setEnviandoEmail] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [plantillas, setPlantillas] = useState([]);

  // Estado del wizard
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [modoCliente, setModoCliente] = useState('buscar');
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  const [clienteOpciones, setClienteOpciones] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [datosManual, setDatosManual] = useState(DATOS_CLIENTE_VACIO);

  const cargarConsentimientos = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filtroTipo) params.tipo = filtroTipo;
    if (busqueda) params.buscar = busqueda;
    getConsentimientos(params)
      .then((res) => setConsentimientos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filtroTipo, busqueda]);

  useEffect(() => { cargarConsentimientos(); }, [cargarConsentimientos]);

  useEffect(() => {
    getPlantillas().then((res) => setPlantillas(res.data)).catch(console.error);
  }, []);

  // Búsqueda de clientes con debounce
  useEffect(() => {
    if (!clienteBusqueda.trim() || clienteSeleccionado) { setClienteOpciones([]); return; }
    const t = setTimeout(() => {
      getClientes(clienteBusqueda)
        .then((res) => setClienteOpciones(res.data.slice(0, 8)))
        .catch(() => setClienteOpciones([]));
    }, 350);
    return () => clearTimeout(t);
  }, [clienteBusqueda, clienteSeleccionado]);

  const abrirModal = () => {
    setPaso(1);
    setTipoSeleccionado('');
    setPlantillaSeleccionada(null);
    setModoCliente('buscar');
    setClienteBusqueda('');
    setClienteOpciones([]);
    setClienteSeleccionado(null);
    setDatosManual(DATOS_CLIENTE_VACIO);
    setError('');
    setExito(null);
    setModalAbierto(true);
  };

  const irAPaso2 = () => {
    const plantilla = plantillas.find((p) => p.tipo === tipoSeleccionado);
    setPlantillaSeleccionada(plantilla || null);
    setPaso(2);
  };

  const handleFirmar = async (firmaBase64) => {
    setSaving(true);
    setError('');
    try {
      const datosCliente = clienteSeleccionado
        ? {
            nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellidos}`,
            dni: clienteSeleccionado.dni || '',
            fecha_nacimiento: clienteSeleccionado.fecha_nacimiento || '',
            telefono: clienteSeleccionado.telefono || '',
          }
        : datosManual;

      const payload = {
        plantilla_id: plantillaSeleccionada?.id,
        tipo: tipoSeleccionado,
        datos_cliente: datosCliente,
        firma_imagen: firmaBase64,
        cliente_id: clienteSeleccionado?.id || null,
      };

      const res = await createConsentimiento(payload);
      setExito(res.data);
      setPaso(4);
      cargarConsentimientos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el consentimiento');
    } finally {
      setSaving(false);
    }
  };

  const tipoLabel = (tipo) => TIPOS.find((t) => t.value === tipo)?.label || tipo;

  const handleEnviarEmail = async (id) => {
    setEnviandoEmail(id);
    try { await enviarEmailConsentimiento(id); }
    catch (e) { console.error(e); }
    finally { setEnviandoEmail(null); }
  };

  const handleRegenerarPdf = async (id) => {
    setRegenerando(id);
    try {
      await regenerarPdfConsentimiento(id);
      await cargarConsentimientos();
    } catch (e) {
      console.error('Error regenerando PDF:', e);
    } finally {
      setRegenerando(null);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-white">Consentimientos</h1>
        <button onClick={abrirModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Nuevo consentimiento
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre de cliente..."
            className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-indigo-500" />
        </div>
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500">
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Cliente</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Tipo</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden sm:table-cell">Fecha firma</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Empleado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 bg-gray-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : consentimientos.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No hay consentimientos</td></tr>
              ) : (
                consentimientos.map((c) => (
                  <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">
                        {c.cliente_nombre || (c.datos_cliente?.nombre) || '—'}
                      </p>
                      {c.datos_cliente?.dni && (
                        <p className="text-gray-500 text-xs">{c.datos_cliente.dni}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TIPO_CONFIG[c.tipo] || ''}`}>
                        {tipoLabel(c.tipo)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                      {c.firmado_en
                        ? new Date(c.firmado_en).toLocaleString('es-ES', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                      {c.empleado_nombre || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.pdf_path ? (
                          <a
                            href={`http://localhost:3000/${c.pdf_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                          >
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Ver PDF
                          </a>
                        ) : (
                          <button
                            disabled={regenerando === c.id}
                            onClick={() => handleRegenerarPdf(c.id)}
                            className="inline-flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                          >
                            {regenerando === c.id
                              ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                              : <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            }
                            {regenerando === c.id ? 'Generando…' : 'Generar PDF'}
                          </button>
                        )}
                        {c.pdf_path && c.cliente_id && (
                          <button
                            disabled={enviandoEmail === c.id}
                            onClick={() => handleEnviarEmail(c.id)}
                            className="inline-flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            title="Enviar copia por email al cliente"
                          >
                            {enviandoEmail === c.id
                              ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                              : <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            }
                            {enviandoEmail === c.id ? 'Enviando…' : 'Email'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Wizard */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70">
          <div className="bg-gray-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl"
            style={{ maxHeight: '95vh' }}>

            {/* Header del modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                {paso < 4 && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className={`w-2 h-2 rounded-full transition-colors ${
                        n === paso ? 'bg-indigo-500' : n < paso ? 'bg-green-500' : 'bg-gray-700'
                      }`} />
                    ))}
                  </div>
                )}
                <span className="text-white font-semibold text-sm">
                  {paso === 1 && 'Tipo y firmante'}
                  {paso === 2 && 'Leer consentimiento'}
                  {paso === 3 && 'Firma digital'}
                  {paso === 4 && '¡Completado!'}
                </span>
              </div>
              <button onClick={() => setModalAbierto(false)}
                className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 65px)' }}>
              {paso === 1 && (
                <Paso1
                  tipoSeleccionado={tipoSeleccionado}
                  setTipoSeleccionado={setTipoSeleccionado}
                  modoCliente={modoCliente}
                  setModoCliente={setModoCliente}
                  clienteBusqueda={clienteBusqueda}
                  setClienteBusqueda={setClienteBusqueda}
                  clienteOpciones={clienteOpciones}
                  setClienteOpciones={setClienteOpciones}
                  clienteSeleccionado={clienteSeleccionado}
                  setClienteSeleccionado={setClienteSeleccionado}
                  datosManual={datosManual}
                  setDatosManual={setDatosManual}
                  onSiguiente={irAPaso2}
                />
              )}

              {paso === 2 && (
                <Paso2
                  plantilla={plantillaSeleccionada}
                  onSiguiente={() => setPaso(3)}
                  onAtras={() => setPaso(1)}
                />
              )}

              {paso === 3 && (
                <Paso3
                  onFirmar={handleFirmar}
                  onAtras={() => setPaso(2)}
                  saving={saving}
                  error={error}
                />
              )}

              {paso === 4 && exito && (
                <div className="text-center space-y-5 py-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">Consentimiento firmado</p>
                    <p className="text-gray-400 text-sm mt-1">El PDF se ha generado y guardado correctamente.</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 text-left space-y-1.5">
                    <p className="text-gray-400 text-xs">
                      <span className="text-gray-500">Tipo:</span>{' '}
                      <span className="text-white">{tipoLabel(exito.tipo)}</span>
                    </p>
                    <p className="text-gray-400 text-xs">
                      <span className="text-gray-500">Firmado el:</span>{' '}
                      <span className="text-white">
                        {new Date(exito.firmado_en || exito.created_at).toLocaleString('es-ES')}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {exito.pdf_path && (
                      <a
                        href={getPdfUrl(exito.pdf_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors text-center"
                      >
                        Ver PDF
                      </a>
                    )}
                    <button onClick={() => setModalAbierto(false)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
