import React, { useEffect, useState, useCallback } from 'react';
import { getProyectos, createProyecto, updateProyecto, getEmpleados, getClientes, getMotivosPerdida } from '../api';
import Modal from '../components/Modal';

/* ── Configuración de estados y colores ────────────────────────────── */
const ESTADO_PROYECTO = {
  Nuevo:         { label: 'Nuevo',         color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'En diseño':   { label: 'En diseño',     color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  Presupuestado: { label: 'Presupuestado', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  Aprobado:      { label: 'Aprobado',      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  'En curso':    { label: 'En curso',      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  Completado:    { label: 'Completado',    color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  Cancelado:     { label: 'Cancelado',     color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const ESTILOS = ['Realismo', 'Blackwork', 'Tradicional', 'Neotradicional', 'Acuarela', 'Geométrico', 'Japones', 'Lettering', 'Minimalista', 'Otro'];

const emptyForm = {
  cliente_id: '', nombre: '', descripcion: '', zona_corporal: '', estilo: '',
  color: 'Color', tamaño_aproximado: '', artista_id: '', sesiones_estimadas: '',
  duracion_estimada: '', precio_estimado: '', estado: 'Nuevo', referencias: '',
  notas_internas: '', origen_comercial: '',
};

function fmtFecha(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Badge({ estado }) {
  const cfg = ESTADO_PROYECTO[estado] || { label: estado, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>;
}

/* ── Componente principal ──────────────────────────────────────────── */
export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [buscar, setBuscar] = useState('');
  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [motivosPerdida, setMotivosPerdida] = useState([]);
  const [detalle, setDetalle] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, empRes, cliRes, motRes] = await Promise.all([getProyectos(), getEmpleados(), getClientes(), getMotivosPerdida()]);
      setProyectos(projRes.data);
      setEmpleados(empRes.data);
      setClientes(cliRes.data);
      setMotivosPerdida(motRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirCrear = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };

  const abrirEditar = (p) => {
    setForm({
      cliente_id: p.cliente_id || '',
      nombre: p.nombre || '',
      descripcion: p.descripcion || '',
      zona_corporal: p.zona_corporal || '',
      estilo: p.estilo || '',
      color: p.color || 'Color',
      tamaño_aproximado: p.tamaño_aproximado || '',
      artista_id: p.artista_id || '',
      sesiones_estimadas: p.sesiones_estimadas || '',
      duracion_estimada: p.duracion_estimada || '',
      precio_estimado: p.precio_estimado || '',
      estado: p.estado || 'Nuevo',
      referencias: p.referencias || '',
      notas_internas: p.notas_internas || '',
      origen_comercial: p.origen_comercial || '',
    });
    setEditId(p.id);
    setModalOpen(true);
  };

  const guardar = async () => {
    try {
      const payload = { ...form, sesiones_estimadas: form.sesiones_estimadas || null, precio_estimado: form.precio_estimado || null, duracion_estimada: form.duracion_estimada || null, cliente_id: form.cliente_id || null, artista_id: form.artista_id || null };
      if (editId) await updateProyecto(editId, payload);
      else await createProyecto(payload);
      setModalOpen(false);
      cargar();
    } catch (e) { console.error(e); }
  };

  const getNombreCliente = (id) => { const c = clientes.find(c => c.id === id); return c ? `${c.nombre} ${c.apellidos || ''}`.trim() : '—'; };
  const getNombreArtista = (id) => { const e = empleados.find(e => e.id === id); return e ? e.nombre : '—'; };

  const filtrados = proyectos.filter(p =>
    (p.nombre || '').toLowerCase().includes(buscar.toLowerCase()) ||
    (p.estilo || '').toLowerCase().includes(buscar.toLowerCase())
  );

  const inp = 'w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-500';

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Proyectos</h1>
          <p className="text-gray-400 text-sm mt-0.5">Gestión de proyectos de tatuaje</p>
        </div>
        <button onClick={abrirCrear}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Proyecto
        </button>
      </div>

      {/* ── Barra de búsqueda ── */}
      <div className="relative max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Buscar proyecto…"
          className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
      </div>

      {/* ── Tarjetas de proyectos ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm">No se encontraron proyectos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(p => (
            <div key={p.id} onClick={() => setDetalle(p)}
              className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-indigo-500/40 transition-all cursor-pointer group hover:shadow-lg hover:shadow-indigo-500/5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-white font-semibold group-hover:text-indigo-400 transition-colors">{p.nombre}</h3>
                <Badge estado={p.estado} />
              </div>
              <p className="text-gray-400 text-xs line-clamp-2 mb-3">{p.descripcion || 'Sin descripción'}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Cliente</span>
                  <p className="text-gray-300">{getNombreCliente(p.cliente_id)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Artista</span>
                  <p className="text-gray-300">{getNombreArtista(p.artista_id)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Estilo</span>
                  <p className="text-gray-300">{p.estilo || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Precio est.</span>
                  <p className="text-gray-300">{p.precio_estimado ? `${Number(p.precio_estimado).toFixed(0)} €` : '—'}</p>
                </div>
              </div>
              {p.sesiones_estimadas && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {p.sesiones_estimadas} sesiones estimadas
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Detalle rápido ── */}
      {detalle && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-center p-4 overflow-y-auto" onClick={() => setDetalle(null)}>
          <div className="bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl my-auto overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gray-900 border-b border-gray-700 px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold text-lg">{detalle.nombre}</h2>
                <Badge estado={detalle.estado} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setDetalle(null); abrirEditar(detalle); }}
                  className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Editar</button>
                <button onClick={() => setDetalle(null)}
                  className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500 block text-xs">Cliente</span><span className="text-white">{getNombreCliente(detalle.cliente_id)}</span></div>
              <div><span className="text-gray-500 block text-xs">Artista</span><span className="text-white">{getNombreArtista(detalle.artista_id)}</span></div>
              <div><span className="text-gray-500 block text-xs">Zona corporal</span><span className="text-white">{detalle.zona_corporal || '—'}</span></div>
              <div><span className="text-gray-500 block text-xs">Estilo</span><span className="text-white">{detalle.estilo || '—'}</span></div>
              <div><span className="text-gray-500 block text-xs">Color</span><span className="text-white">{detalle.color || '—'}</span></div>
              <div><span className="text-gray-500 block text-xs">Tamaño aprox.</span><span className="text-white">{detalle.tamaño_aproximado || '—'}</span></div>
              <div><span className="text-gray-500 block text-xs">Sesiones est.</span><span className="text-white">{detalle.sesiones_estimadas || '—'}</span></div>
              <div><span className="text-gray-500 block text-xs">Precio est.</span><span className="text-white">{detalle.precio_estimado ? `${Number(detalle.precio_estimado).toFixed(2)} €` : '—'}</span></div>
              <div className="col-span-2"><span className="text-gray-500 block text-xs">Descripción</span><span className="text-white whitespace-pre-wrap">{detalle.descripcion || '—'}</span></div>
              <div className="col-span-2"><span className="text-gray-500 block text-xs">Referencias</span><span className="text-white whitespace-pre-wrap">{detalle.referencias || '—'}</span></div>
              <div className="col-span-2"><span className="text-gray-500 block text-xs">Notas internas</span><span className="text-gray-300 whitespace-pre-wrap">{detalle.notas_internas || '—'}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Crear/Editar ── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Editar Proyecto' : 'Nuevo Proyecto'} maxWidth="max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Nombre del proyecto *</label>
            <input className={inp} value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej: Manga realista brazo completo" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Cliente</label>
            <select className={inp} value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})}>
              <option value="">Sin cliente</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellidos || ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Artista asignado</label>
            <select className={inp} value={form.artista_id} onChange={e => setForm({...form, artista_id: e.target.value})}>
              <option value="">Sin asignar</option>
              {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Zona corporal</label>
            <input className={inp} value={form.zona_corporal} onChange={e => setForm({...form, zona_corporal: e.target.value})} placeholder="Brazo, espalda…" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Estilo</label>
            <select className={inp} value={form.estilo} onChange={e => setForm({...form, estilo: e.target.value})}>
              <option value="">Seleccionar…</option>
              {ESTILOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Color</label>
            <select className={inp} value={form.color} onChange={e => setForm({...form, color: e.target.value})}>
              <option value="Color">Color</option>
              <option value="B/N">Blanco y Negro</option>
              <option value="Mixto">Mixto</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tamaño aproximado</label>
            <input className={inp} value={form.tamaño_aproximado} onChange={e => setForm({...form, tamaño_aproximado: e.target.value})} placeholder="20x30 cm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Sesiones estimadas</label>
            <input className={inp} type="number" min="1" value={form.sesiones_estimadas} onChange={e => setForm({...form, sesiones_estimadas: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Duración estimada (horas)</label>
            <input className={inp} type="number" min="0" step="0.5" value={form.duracion_estimada} onChange={e => setForm({...form, duracion_estimada: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Precio estimado (€)</label>
            <input className={inp} type="number" min="0" step="0.01" value={form.precio_estimado} onChange={e => setForm({...form, precio_estimado: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Estado</label>
            <select className={inp} value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
              {Object.keys(ESTADO_PROYECTO).map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
          {form.estado === 'Cancelado' && (
            <div>
              <label className="block text-xs text-red-400 mb-1">Motivo de Cancelación / Pérdida</label>
              <select className={inp} onChange={e => {
                if (e.target.value) {
                  const notaActual = form.notas_internas ? form.notas_internas + '\n' : '';
                  setForm({...form, notas_internas: `${notaActual}[Motivo de cancelación: ${e.target.value}]`});
                }
              }}>
                <option value="">Seleccionar motivo...</option>
                {motivosPerdida.map(m => <option key={m.id} value={m.descripcion}>{m.descripcion}</option>)}
              </select>
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Descripción</label>
            <textarea className={inp} rows={3} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Descripción del proyecto…" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Referencias (URLs o descripción)</label>
            <textarea className={inp} rows={2} value={form.referencias} onChange={e => setForm({...form, referencias: e.target.value})} placeholder="Enlaces a imágenes de referencia…" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Notas internas</label>
            <textarea className={inp} rows={2} value={form.notas_internas} onChange={e => setForm({...form, notas_internas: e.target.value})} placeholder="Notas privadas del equipo…" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancelar</button>
          <button onClick={guardar} disabled={!form.nombre}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20">
            {editId ? 'Guardar Cambios' : 'Crear Proyecto'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
