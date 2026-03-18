import React, { useEffect, useState, useCallback, useRef } from 'react';
import Modal from '../components/Modal';
import {
  getCabinas, cambiarEstadoCabina, crearCabina,
  getLimpiezas, getResumenLimpiezas, crearLimpieza, eliminarLimpieza,
  getIncidencias, crearIncidencia, resolverIncidencia,
  getImagenUrl,
} from '../api';

// ─── Constantes ──────────────────────────────────────────────────────────────
const TIPOS_LIMPIEZA = [
  { value: 'profunda',      label: 'Limpieza profunda' },
  { value: 'esterilizacion', label: 'Esterilización de material' },
  { value: 'revision',      label: 'Revisión de equipos' },
];

const HOY = new Date().toISOString().split('T')[0];

// ─── Helpers visuales ────────────────────────────────────────────────────────
function EstadoBadge({ estado }) {
  return estado === 'disponible'
    ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />Disponible</span>
    : <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />Ocupada</span>;
}

// ─── Tarjeta de cabina ────────────────────────────────────────────────────────
function TarjetaCabina({ cabina, onCambiarEstado, onRegistrarLimpieza, onVerHistorial, onVerIncidencias }) {
  const [cambiando, setCambiando] = useState(false);

  const handleToggle = async () => {
    setCambiando(true);
    const nuevoEstado = cabina.estado === 'disponible' ? 'ocupada' : 'disponible';
    await onCambiarEstado(cabina.id, nuevoEstado).catch(console.error);
    setCambiando(false);
  };

  const abiertas = parseInt(cabina.incidencias_abiertas || 0);

  return (
    <div className={`bg-gray-900 rounded-2xl p-5 flex flex-col gap-4 border-2 transition-colors ${
      cabina.estado === 'disponible' ? 'border-green-500/20' : 'border-yellow-500/20'
    }`}>
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-white font-bold text-base leading-tight">{cabina.nombre}</p>
          {cabina.descripcion && (
            <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{cabina.descripcion}</p>
          )}
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
          <EstadoBadge estado={cabina.estado} />
          {abiertas > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
              {abiertas} incidencia{abiertas > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleToggle}
          disabled={cambiando}
          className={`py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
            cabina.estado === 'disponible'
              ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400'
              : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
          }`}
        >
          {cambiando ? '…' : cabina.estado === 'disponible' ? 'Marcar ocupada' : 'Marcar libre'}
        </button>
        <button
          onClick={() => onRegistrarLimpieza(cabina)}
          className="py-2 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 transition-colors"
        >
          + Limpieza
        </button>
        <button
          onClick={() => onVerHistorial(cabina)}
          className="py-2 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors"
        >
          Historial
        </button>
        <button
          onClick={() => onVerIncidencias(cabina)}
          className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
            abiertas > 0
              ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
          }`}
        >
          Incidencias
        </button>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function Cabinas() {
  const [tab, setTab] = useState('cabinas'); // 'cabinas' | 'incidencias' | 'historial'
  const [cabinas, setCabinas] = useState([]);
  const [limpiezas, setLimpiezas] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros historial
  const [filtroFecha, setFiltroFecha] = useState(HOY);
  const [filtroCabinaHist, setFiltroCabinaHist] = useState('');

  // Filtros incidencias
  const [filtroEstadoInc, setFiltroEstadoInc] = useState('');

  // Modales
  const [modalLimpieza, setModalLimpieza] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [modalIncidencia, setModalIncidencia] = useState(false);
  const [modalNuevaCabina, setModalNuevaCabina] = useState(false);

  // Cabina seleccionada para modal
  const [cabinaCtx, setCabinaCtx] = useState(null);
  const [historialCabina, setHistorialCabina] = useState([]);

  // Formularios
  const [limpiezaForm, setLimpiezaForm] = useState({ tipo: 'profunda', hora_inicio: '', hora_fin: '', observaciones: '' });
  const [incForm, setIncForm] = useState({ cabina_id: '', titulo: '', descripcion: '' });
  const [nuevaCabinaForm, setNuevaCabinaForm] = useState({ nombre: '', descripcion: '' });
  const [fotoFile, setFotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fotoInputRef = useRef(null);

  // ── Carga de datos ──────────────────────────────────────────────────────────
  const cargarCabinas = useCallback(async () => {
    const res = await getCabinas().catch(() => ({ data: [] }));
    setCabinas(res.data);
  }, []);

  const cargarLimpiezas = useCallback(async () => {
    const params = {};
    if (filtroFecha) params.fecha = filtroFecha;
    if (filtroCabinaHist) params.cabina_id = filtroCabinaHist;
    const [lRes, rRes] = await Promise.all([
      getLimpiezas(params).catch(() => ({ data: [] })),
      getResumenLimpiezas(filtroFecha || HOY).catch(() => ({ data: [] })),
    ]);
    setLimpiezas(lRes.data);
    setResumen(rRes.data);
  }, [filtroFecha, filtroCabinaHist]);

  const cargarIncidencias = useCallback(async () => {
    const params = {};
    if (filtroEstadoInc) params.estado = filtroEstadoInc;
    const res = await getIncidencias(params).catch(() => ({ data: [] }));
    setIncidencias(res.data);
  }, [filtroEstadoInc]);

  useEffect(() => {
    Promise.all([cargarCabinas(), cargarLimpiezas(), cargarIncidencias()])
      .finally(() => setLoading(false));
  }, [cargarCabinas, cargarLimpiezas, cargarIncidencias]);

  // ── Handlers de cabina ──────────────────────────────────────────────────────
  const handleCambiarEstado = async (id, estado) => {
    await cambiarEstadoCabina(id, estado);
    cargarCabinas();
  };

  const handleRegistrarLimpieza = (cabina) => {
    setCabinaCtx(cabina);
    setLimpiezaForm({ tipo: 'profunda', hora_inicio: '', hora_fin: '', observaciones: '' });
    setError('');
    setModalLimpieza(true);
  };

  const handleVerHistorial = async (cabina) => {
    setCabinaCtx(cabina);
    const res = await getLimpiezas({ cabina_id: cabina.id }).catch(() => ({ data: [] }));
    setHistorialCabina(res.data);
    setModalHistorial(true);
  };

  const handleVerIncidencias = (cabina) => {
    setCabinaCtx(cabina);
    setIncForm({ cabina_id: cabina.id, titulo: '', descripcion: '' });
    setFotoFile(null);
    setTab('incidencias');
  };

  // ── Submit limpieza ─────────────────────────────────────────────────────────
  const handleSubmitLimpieza = async (e) => {
    e.preventDefault();
    if (!limpiezaForm.hora_inicio) { setError('La hora de inicio es obligatoria'); return; }
    setSaving(true);
    setError('');
    try {
      await crearLimpieza({ ...limpiezaForm, cabina_id: cabinaCtx.id, fecha: HOY });
      setModalLimpieza(false);
      cargarLimpiezas();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  // ── Submit incidencia ───────────────────────────────────────────────────────
  const handleSubmitIncidencia = async (e) => {
    e.preventDefault();
    if (!incForm.titulo.trim()) { setError('El título es obligatorio'); return; }
    if (!incForm.cabina_id) { setError('Selecciona una cabina'); return; }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('cabina_id', incForm.cabina_id);
      fd.append('titulo', incForm.titulo);
      fd.append('descripcion', incForm.descripcion);
      if (fotoFile) fd.append('foto', fotoFile);
      await crearIncidencia(fd);
      setModalIncidencia(false);
      setFotoFile(null);
      cargarIncidencias();
      cargarCabinas(); // actualiza contador
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  // ── Resolver incidencia ─────────────────────────────────────────────────────
  const handleResolver = async (id) => {
    await resolverIncidencia(id).catch(console.error);
    cargarIncidencias();
    cargarCabinas();
  };

  // ── Submit nueva cabina ─────────────────────────────────────────────────────
  const handleSubmitNuevaCabina = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await crearCabina(nuevaCabinaForm);
      setModalNuevaCabina(false);
      setNuevaCabinaForm({ nombre: '', descripcion: '' });
      cargarCabinas();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear');
    } finally { setSaving(false); }
  };

  // ── Resumen limpiezas ───────────────────────────────────────────────────────
  const TIPO_LABEL = Object.fromEntries(TIPOS_LIMPIEZA.map((t) => [t.value, t.label]));
  const totalLimpiezas = resumen.reduce((s, r) => s + parseInt(r.total), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-800 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-44 bg-gray-900 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Cabinas</h1>
        <div className="flex gap-2">
          <button onClick={() => { setError(''); setModalNuevaCabina(true); }}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors">
            + Cabina
          </button>
          <button onClick={() => { setIncForm({ cabina_id: '', titulo: '', descripcion: '' }); setFotoFile(null); setError(''); setModalIncidencia(true); }}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium px-3 py-2 rounded-lg transition-colors">
            + Incidencia
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-xl p-1 w-fit">
        {[
          { key: 'cabinas', label: 'Panel' },
          { key: 'incidencias', label: `Incidencias${incidencias.filter((i) => i.estado === 'abierta').length > 0 ? ` (${incidencias.filter((i) => i.estado === 'abierta').length})` : ''}` },
          { key: 'historial', label: 'Historial' },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Panel ── */}
      {tab === 'cabinas' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cabinas.map((c) => (
            <TarjetaCabina
              key={c.id}
              cabina={c}
              onCambiarEstado={handleCambiarEstado}
              onRegistrarLimpieza={handleRegistrarLimpieza}
              onVerHistorial={handleVerHistorial}
              onVerIncidencias={handleVerIncidencias}
            />
          ))}
        </div>
      )}

      {/* ── Tab Incidencias ── */}
      {tab === 'incidencias' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap items-center justify-between">
            <select value={filtroEstadoInc} onChange={(e) => setFiltroEstadoInc(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
              <option value="">Todas</option>
              <option value="abierta">Abiertas</option>
              <option value="resuelta">Resueltas</option>
            </select>
            <button onClick={() => { setIncForm({ cabina_id: cabinas[0]?.id || '', titulo: '', descripcion: '' }); setFotoFile(null); setError(''); setModalIncidencia(true); }}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              + Nueva incidencia
            </button>
          </div>

          {incidencias.length === 0 ? (
            <div className="bg-gray-900 rounded-xl p-10 text-center text-gray-500">No hay incidencias</div>
          ) : (
            <div className="space-y-3">
              {incidencias.map((inc) => (
                <div key={inc.id} className={`bg-gray-900 rounded-xl p-4 flex gap-4 border ${
                  inc.estado === 'abierta' ? 'border-red-500/20' : 'border-gray-800'
                }`}>
                  {inc.foto_path && (
                    <a href={getImagenUrl(inc.foto_path)} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0">
                      <img src={getImagenUrl(inc.foto_path)} alt="foto"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-700" />
                    </a>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-white font-semibold text-sm">{inc.titulo}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{inc.cabina_nombre} · {new Date(inc.fecha).toLocaleDateString('es-ES')}</p>
                      </div>
                      <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        inc.estado === 'abierta'
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : 'bg-green-500/15 text-green-400 border-green-500/30'
                      }`}>
                        {inc.estado === 'abierta' ? 'Abierta' : 'Resuelta'}
                      </span>
                    </div>
                    {inc.descripcion && <p className="text-gray-400 text-xs mt-1">{inc.descripcion}</p>}
                    {inc.estado === 'abierta' && (
                      <button onClick={() => handleResolver(inc.id)}
                        className="mt-2 text-xs text-green-400 hover:text-green-300 font-medium">
                        ✓ Marcar como resuelta
                      </button>
                    )}
                    {inc.resuelta_en && (
                      <p className="text-gray-600 text-xs mt-1">
                        Resuelta: {new Date(inc.resuelta_en).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab Historial ── */}
      {tab === 'historial' && (
        <div className="space-y-4">
          {/* Resumen del día */}
          <div className="bg-gray-900 rounded-xl p-4 flex flex-wrap gap-6 items-center">
            <div>
              <p className="text-gray-500 text-xs">Total limpiezas</p>
              <p className="text-white text-2xl font-bold">{totalLimpiezas}</p>
            </div>
            {resumen.map((r) => (
              <div key={r.tipo}>
                <p className="text-gray-500 text-xs">{TIPO_LABEL[r.tipo] || r.tipo}</p>
                <p className="text-gray-300 text-lg font-semibold">{r.total}</p>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="flex gap-3 flex-wrap">
            <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
            <select value={filtroCabinaHist} onChange={(e) => setFiltroCabinaHist(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
              <option value="">Todas las cabinas</option>
              {cabinas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {(filtroFecha !== HOY || filtroCabinaHist) && (
              <button onClick={() => { setFiltroFecha(HOY); setFiltroCabinaHist(''); }}
                className="text-sm text-gray-400 hover:text-white">Limpiar</button>
            )}
          </div>

          {/* Tabla */}
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Cabina</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Tipo</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 hidden sm:table-cell">Hora</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Empleado</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 hidden lg:table-cell">Observaciones</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {limpiezas.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Sin registros</td></tr>
                ) : (
                  limpiezas.map((l) => (
                    <tr key={l.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-white font-medium">{l.cabina_nombre}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {TIPO_LABEL[l.tipo] || l.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                        {l.hora_inicio?.slice(0, 5)}{l.hora_fin ? ` – ${l.hora_fin.slice(0, 5)}` : ''}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">{l.empleado_nombre || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell max-w-xs truncate">{l.observaciones || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={async () => { await eliminarLimpieza(l.id).catch(console.error); cargarLimpiezas(); }}
                          className="text-xs text-red-400 hover:text-red-300">Eliminar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal Registrar Limpieza ── */}
      <Modal isOpen={modalLimpieza} onClose={() => setModalLimpieza(false)}
        title={`Registrar limpieza — ${cabinaCtx?.nombre}`}>
        <form onSubmit={handleSubmitLimpieza} className="space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Tipo *</label>
            <select value={limpiezaForm.tipo} onChange={(e) => setLimpiezaForm({ ...limpiezaForm, tipo: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500">
              {TIPOS_LIMPIEZA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Hora inicio *</label>
              <input type="time" required value={limpiezaForm.hora_inicio}
                onChange={(e) => setLimpiezaForm({ ...limpiezaForm, hora_inicio: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Hora fin</label>
              <input type="time" value={limpiezaForm.hora_fin}
                onChange={(e) => setLimpiezaForm({ ...limpiezaForm, hora_fin: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Observaciones</label>
            <textarea rows={3} value={limpiezaForm.observaciones}
              onChange={(e) => setLimpiezaForm({ ...limpiezaForm, observaciones: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalLimpieza(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal Historial de cabina ── */}
      <Modal isOpen={modalHistorial} onClose={() => setModalHistorial(false)}
        title={`Historial — ${cabinaCtx?.nombre}`}>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {historialCabina.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Sin registros de limpieza</p>
          ) : (
            historialCabina.map((l) => (
              <div key={l.id} className="bg-gray-800 rounded-lg px-3 py-2.5 flex items-center gap-3">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                  {TIPO_LABEL[l.tipo] || l.tipo}
                </span>
                <span className="text-gray-300 text-xs">
                  {new Date(l.fecha).toLocaleDateString('es-ES')} · {l.hora_inicio?.slice(0, 5)}
                  {l.hora_fin ? ` – ${l.hora_fin.slice(0, 5)}` : ''}
                </span>
                <span className="text-gray-500 text-xs ml-auto">{l.empleado_nombre}</span>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* ── Modal Nueva Incidencia ── */}
      <Modal isOpen={modalIncidencia} onClose={() => setModalIncidencia(false)} title="Nueva incidencia">
        <form onSubmit={handleSubmitIncidencia} className="space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Cabina *</label>
            <select required value={incForm.cabina_id} onChange={(e) => setIncForm({ ...incForm, cabina_id: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500">
              <option value="">Seleccionar cabina…</option>
              {cabinas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Título *</label>
            <input required value={incForm.titulo} onChange={(e) => setIncForm({ ...incForm, titulo: e.target.value })}
              placeholder="Describe brevemente el problema"
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Descripción</label>
            <textarea rows={3} value={incForm.descripcion} onChange={(e) => setIncForm({ ...incForm, descripcion: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Foto (opcional)</label>
            <input ref={fotoInputRef} type="file" accept="image/*" capture="environment"
              onChange={(e) => setFotoFile(e.target.files[0] || null)}
              className="hidden" />
            <button type="button" onClick={() => fotoInputRef.current?.click()}
              className="w-full bg-gray-700 border border-gray-600 border-dashed text-gray-400 hover:text-white text-sm rounded-lg px-3 py-3 transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {fotoFile ? fotoFile.name : 'Hacer foto o subir imagen'}
            </button>
            {fotoFile && (
              <div className="mt-2 flex items-center gap-2">
                <img src={URL.createObjectURL(fotoFile)} alt="preview"
                  className="w-12 h-12 object-cover rounded-lg border border-gray-700" />
                <button type="button" onClick={() => { setFotoFile(null); if (fotoInputRef.current) fotoInputRef.current.value = ''; }}
                  className="text-xs text-red-400 hover:text-red-300">Quitar</button>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalIncidencia(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
              {saving ? 'Guardando…' : 'Crear incidencia'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal Nueva Cabina ── */}
      <Modal isOpen={modalNuevaCabina} onClose={() => setModalNuevaCabina(false)} title="Nueva cabina">
        <form onSubmit={handleSubmitNuevaCabina} className="space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Nombre *</label>
            <input required value={nuevaCabinaForm.nombre}
              onChange={(e) => setNuevaCabinaForm({ ...nuevaCabinaForm, nombre: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Descripción</label>
            <textarea rows={2} value={nuevaCabinaForm.descripcion}
              onChange={(e) => setNuevaCabinaForm({ ...nuevaCabinaForm, descripcion: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalNuevaCabina(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
              {saving ? 'Creando…' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
