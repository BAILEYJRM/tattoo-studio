import React, { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getLeads, createLead, updateLead, getEmpleados, getMotivosPerdida, convertirLead } from '../api';
import Modal from '../components/Modal';

/* ── Configuración de estados y colores ────────────────────────────── */
const ESTADO_LEAD = {
  Nuevo:       { label: 'Nuevo',       color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  Contactado:  { label: 'Contactado',  color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  Interesado:  { label: 'Interesado',  color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  'En Proceso':{ label: 'En Proceso',  color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  Convertido:  { label: 'Convertido',  color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  Perdido:     { label: 'Perdido',     color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const ORIGENES = ['Instagram', 'Facebook', 'TikTok', 'Web', 'Recomendación', 'Walk-in', 'Otro'];

const emptyForm = {
  nombre: '', telefono: '', email: '', instagram: '', origen: '',
  artista_solicitado: '', estilo_solicitado: '', descripcion: '',
  notas_internas: '', responsable_id: '', estado: 'Nuevo',
};

/* ── Helpers ───────────────────────────────────────────────────────── */
function fmtFecha(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Badge({ estado }) {
  const cfg = ESTADO_LEAD[estado] || { label: estado, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>;
}

/* ── Componente principal ──────────────────────────────────────────── */
export default function Leads() {
  const { t } = useLanguage();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [buscar, setBuscar] = useState('');
  const [empleados, setEmpleados] = useState([]);
  const [motivosPerdida, setMotivosPerdida] = useState([]);
  const [detalle, setDetalle] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsRes, empRes, motRes] = await Promise.all([getLeads(), getEmpleados(), getMotivosPerdida()]);
      setLeads(leadsRes.data);
      setEmpleados(empRes.data);
      setMotivosPerdida(motRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirCrear = () => {
    setForm(emptyForm);
    setEditId(null);
    setModalOpen(true);
  };

  const abrirEditar = (lead) => {
    setForm({
      nombre: lead.nombre || '',
      telefono: lead.telefono || '',
      email: lead.email || '',
      instagram: lead.instagram || '',
      origen: lead.origen || '',
      artista_solicitado: lead.artista_solicitado || '',
      estilo_solicitado: lead.estilo_solicitado || '',
      descripcion: lead.descripcion || '',
      notas_internas: lead.notas_internas || '',
      responsable_id: lead.responsable_id || '',
      estado: lead.estado || 'Nuevo',
    });
    setEditId(lead.id);
    setModalOpen(true);
  };

  const guardar = async () => {
    try {
      if (editId) {
        await updateLead(editId, form);
      } else {
        await createLead(form);
      }
      setModalOpen(false);
      cargar();
    } catch (e) { console.error(e); }
  };

  const ejecutarConversion = async (id) => {
    try {
      await convertirLead(id);
      setDetalle(null);
      cargar();
    } catch (e) { console.error(e); }
  };

  const leadsFiltrados = leads.filter(l =>
    (l.nombre || '').toLowerCase().includes(buscar.toLowerCase()) ||
    (l.email || '').toLowerCase().includes(buscar.toLowerCase()) ||
    (l.telefono || '').toLowerCase().includes(buscar.toLowerCase())
  );

  const inp = 'w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-500';

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('leads_titulo')}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{t('leads')}</p>
        </div>
        <button onClick={abrirCrear}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          + {t('nuevo_lead')}
        </button>
      </div>

      {/* ── Barra de búsqueda + stats ── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Buscar por nombre, email o teléfono…"
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        </div>
        {/* Stats rápidas */}
        <div className="flex gap-2 text-xs">
          {['Nuevo', 'Contactado', 'Convertido', 'Perdido'].map(st => {
            const count = leads.filter(l => l.estado === st).length;
            return (
              <div key={st} className="px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-center min-w-[70px]">
                <p className="text-gray-400">{st}</p>
                <p className="text-white font-bold text-base">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tabla ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leadsFiltrados.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <p className="text-sm">No se encontraron leads</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Contacto</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Origen</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Creado</th>
                  <th className="px-4 py-3 font-medium text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {leadsFiltrados.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-750 hover:bg-gray-700/30 transition-colors cursor-pointer" onClick={() => setDetalle(lead)}>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{lead.nombre}</p>
                      {lead.estilo_solicitado && <p className="text-gray-500 text-xs">{lead.estilo_solicitado}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-gray-300 text-xs">{lead.email || '—'}</p>
                      <p className="text-gray-500 text-xs">{lead.telefono || '—'}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-400">{lead.origen || '—'}</td>
                    <td className="px-4 py-3"><Badge estado={lead.estado} /></td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">{fmtFecha(lead.creado_en)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); abrirEditar(lead); }}
                        className="text-gray-400 hover:text-indigo-400 transition-colors p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                {detalle.estado !== 'Convertido' && (
                  <button onClick={() => ejecutarConversion(detalle.id)}
                    className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-sm">
                    <span>Convertir a Cliente</span>
                  </button>
                )}
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
              <div><span className="text-gray-500 block text-xs">Email</span><span className="text-white">{detalle.email || '—'}</span></div>
              <div><span className="text-gray-500 block text-xs">Teléfono</span><span className="text-white">{detalle.telefono || '—'}</span></div>
              <div><span className="text-gray-500 block text-xs">Instagram</span><span className="text-white">{detalle.instagram || '—'}</span></div>
              <div><span className="text-gray-500 block text-xs">Origen</span><span className="text-white">{detalle.origen || '—'}</span></div>
              <div><span className="text-gray-500 block text-xs">Artista solicitado</span><span className="text-white">{detalle.artista_solicitado || '—'}</span></div>
              <div><span className="text-gray-500 block text-xs">Estilo</span><span className="text-white">{detalle.estilo_solicitado || '—'}</span></div>
              <div className="col-span-2"><span className="text-gray-500 block text-xs">Descripción</span><span className="text-white whitespace-pre-wrap">{detalle.descripcion || '—'}</span></div>
              <div className="col-span-2"><span className="text-gray-500 block text-xs">Notas internas</span><span className="text-gray-300 whitespace-pre-wrap">{detalle.notas_internas || '—'}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Crear/Editar ── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Editar Lead' : 'Nuevo Lead'} maxWidth="max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
            <input className={inp} value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Nombre del contacto" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Teléfono</label>
            <input className={inp} value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="+34 600 000 000" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Email</label>
            <input className={inp} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@ejemplo.com" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Instagram</label>
            <input className={inp} value={form.instagram} onChange={e => setForm({...form, instagram: e.target.value})} placeholder="@usuario" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Origen</label>
            <select className={inp} value={form.origen} onChange={e => setForm({...form, origen: e.target.value})}>
              <option value="">Seleccionar…</option>
              {ORIGENES.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Estado</label>
            <select className={inp} value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
              {Object.keys(ESTADO_LEAD).map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
          {form.estado === 'Perdido' && (
            <div>
              <label className="block text-xs text-red-400 mb-1">Motivo de Pérdida</label>
              <select className={inp} onChange={e => {
                if (e.target.value) {
                  const notaActual = form.notas_internas ? form.notas_internas + '\n' : '';
                  setForm({...form, notas_internas: `${notaActual}[Motivo de pérdida: ${e.target.value}]`});
                }
              }}>
                <option value="">Seleccionar motivo...</option>
                {motivosPerdida.map(m => <option key={m.id} value={m.descripcion}>{m.descripcion}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Artista solicitado</label>
            <input className={inp} value={form.artista_solicitado} onChange={e => setForm({...form, artista_solicitado: e.target.value})} placeholder="Nombre del artista" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Estilo solicitado</label>
            <input className={inp} value={form.estilo_solicitado} onChange={e => setForm({...form, estilo_solicitado: e.target.value})} placeholder="Realismo, Blackwork…" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Responsable</label>
            <select className={inp} value={form.responsable_id} onChange={e => setForm({...form, responsable_id: e.target.value})}>
              <option value="">Sin asignar</option>
              {empleados.map(emp => <option key={emp.id} value={emp.id}>{emp.nombre}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Descripción</label>
            <textarea className={inp} rows={3} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Describe el proyecto que busca el cliente…" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Notas internas</label>
            <textarea className={inp} rows={2} value={form.notas_internas} onChange={e => setForm({...form, notas_internas: e.target.value})} placeholder="Notas privadas del equipo…" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
          <button onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancelar</button>
          <button onClick={guardar} disabled={!form.nombre}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20">
            {editId ? 'Guardar Cambios' : 'Crear Lead'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
