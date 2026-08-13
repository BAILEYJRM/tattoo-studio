import React, { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getSeguimientos, createSeguimiento, updateSeguimiento, getLeads, getProyectos, getEmpleados } from '../api';
import Modal from '../components/Modal';

const ESTADOS_SEGUIMIENTO = {
  Pendiente:  { label: 'Pendiente',  color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  Completado: { label: 'Completado', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  Cancelado:  { label: 'Cancelado',  color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const emptyForm = {
  lead_id: '',
  proyecto_id: '',
  fecha_hora: new Date().toISOString().slice(0, 16),
  responsable_id: '',
  motivo: '',
  estado: 'Pendiente',
  notas: ''
};

function fmtFechaHora(d) {
  if (!d) return '—';
  const fecha = new Date(d);
  return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Badge({ estado }) {
  const cfg = ESTADOS_SEGUIMIENTO[estado] || { label: estado, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  return <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.color}`}>{cfg.label}</span>;
}

export default function Seguimientos() {
  const { t } = useLanguage();
  const [seguimientos, setSeguimientos] = useState([]);
  const [leads, setLeads] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [buscar, setBuscar] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [segRes, leadRes, proyRes, empRes] = await Promise.all([
        getSeguimientos(),
        getLeads(),
        getProyectos(),
        getEmpleados()
      ]);
      setSeguimientos(segRes.data);
      setLeads(leadRes.data);
      setProyectos(proyRes.data);
      setEmpleados(empRes.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirCrear = () => {
    setForm(emptyForm);
    setEditId(null);
    setModalOpen(true);
  };

  const abrirEditar = (seg) => {
    setForm({
      lead_id: seg.lead_id || '',
      proyecto_id: seg.proyecto_id || '',
      fecha_hora: seg.fecha_hora ? new Date(seg.fecha_hora).toISOString().slice(0, 16) : '',
      responsable_id: seg.responsable_id || '',
      motivo: seg.motivo || '',
      estado: seg.estado || 'Pendiente',
      notas: seg.notas || ''
    });
    setEditId(seg.id);
    setModalOpen(true);
  };

  const guardar = async () => {
    try {
      const payload = {
        ...form,
        lead_id: form.lead_id || null,
        proyecto_id: form.proyecto_id || null,
        responsable_id: form.responsable_id || null,
      };
      if (editId) {
        await updateSeguimiento(editId, payload);
      } else {
        await createSeguimiento(payload);
      }
      setModalOpen(false);
      cargar();
    } catch (e) {
      console.error(e);
    }
  };

  const cambiarEstadoRapido = async (seg, nuevoEstado) => {
    try {
      await updateSeguimiento(seg.id, { ...seg, estado: nuevoEstado });
      cargar();
    } catch (e) {
      console.error(e);
    }
  };

  const getNombreLead = (id) => {
    const l = leads.find(item => item.id === id);
    return l ? l.nombre : '—';
  };

  const getNombreProyecto = (id) => {
    const p = proyectos.find(item => item.id === id);
    return p ? p.nombre : '—';
  };

  const getNombreResponsable = (id) => {
    const e = empleados.find(item => item.id === id);
    return e ? e.nombre : '—';
  };

  const filtrados = seguimientos.filter(s => {
    const coincideEstado = filtroEstado === 'Todos' || s.estado === filtroEstado;
    const textoBuscar = buscar.toLowerCase();
    const coincideTexto = (s.motivo || '').toLowerCase().includes(textoBuscar) ||
      (s.notas || '').toLowerCase().includes(textoBuscar) ||
      getNombreLead(s.lead_id).toLowerCase().includes(textoBuscar) ||
      getNombreProyecto(s.proyecto_id).toLowerCase().includes(textoBuscar);
    return coincideEstado && coincideTexto;
  });

  const inp = 'w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('seguimientos_titulo')}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{t('seguimientos')}</p>
        </div>
        <button onClick={abrirCrear}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          + {t('nuevo')}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Buscar motivo, lead o nota…"
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {['Todos', 'Pendiente', 'Completado', 'Cancelado'].map(st => (
            <button key={st} onClick={() => setFiltroEstado(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtroEstado === st ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}>
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Listado */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">No hay seguimientos registrados</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="px-4 py-3 font-medium">Fecha / Hora</th>
                  <th className="px-4 py-3 font-medium">Motivo</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Relacionado con</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Responsable</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filtrados.map(s => (
                  <tr key={s.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap text-xs font-mono">
                      {fmtFechaHora(s.fecha_hora)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{s.motivo || 'Sin motivo'}</p>
                      {s.notas && <p className="text-gray-400 text-xs line-clamp-1">{s.notas}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs">
                      {s.lead_id && <span className="block text-indigo-400">Lead: {getNombreLead(s.lead_id)}</span>}
                      {s.proyecto_id && <span className="block text-purple-400">Proyecto: {getNombreProyecto(s.proyecto_id)}</span>}
                      {!s.lead_id && !s.proyecto_id && <span className="text-gray-500">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs">
                      {getNombreResponsable(s.responsable_id)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge estado={s.estado} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {s.estado === 'Pendiente' && (
                          <button onClick={() => cambiarEstadoRapido(s, 'Completado')}
                            className="px-2 py-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs rounded border border-green-500/20 transition-colors">
                            Completar
                          </button>
                        )}
                        <button onClick={() => abrirEditar(s)}
                          className="p-1.5 text-gray-400 hover:text-indigo-400 transition-colors rounded-lg hover:bg-gray-700">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Editar Seguimiento' : 'Nuevo Seguimiento'} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Motivo / Asunto *</label>
            <input className={inp} value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} placeholder="Ej: Llamada de seguimiento de presupuesto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Lead Asociado</label>
              <select className={inp} value={form.lead_id} onChange={e => setForm({...form, lead_id: e.target.value})}>
                <option value="">Ninguno</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Proyecto Asociado</label>
              <select className={inp} value={form.proyecto_id} onChange={e => setForm({...form, proyecto_id: e.target.value})}>
                <option value="">Ninguno</option>
                {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Fecha y Hora *</label>
              <input className={inp} type="datetime-local" value={form.fecha_hora} onChange={e => setForm({...form, fecha_hora: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Responsable</label>
              <select className={inp} value={form.responsable_id} onChange={e => setForm({...form, responsable_id: e.target.value})}>
                <option value="">Sin asignar</option>
                {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Estado</label>
            <select className={inp} value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
              {Object.keys(ESTADOS_SEGUIMIENTO).map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Notas / Detalles</label>
            <textarea className={inp} rows={3} value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} placeholder="Detalles de la conversación, compromisos…" />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancelar</button>
          <button onClick={guardar} disabled={!form.motivo}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20">
            {editId ? 'Guardar Cambios' : 'Crear Seguimiento'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
