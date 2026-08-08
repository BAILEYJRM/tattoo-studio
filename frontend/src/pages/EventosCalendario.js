import React, { useEffect, useState, useCallback } from 'react';
import { getEventos, crearEvento, updateEvento, eliminarEvento, getEmpleados } from '../api';
import Modal from '../components/Modal';

const TIPOS = ['convención', 'viaje', 'formación', 'otro'];
const TIPO_COLOR = {
  'convención': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'viaje': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'formación': 'bg-green-500/10 text-green-400 border-green-500/20',
  'otro': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const emptyForm = {
  titulo: '', descripcion: '', empleado_id: '',
  fecha_inicio: '', fecha_fin: '', tipo: 'otro',
};

export default function EventosCalendario() {
  const [eventos, setEventos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, empRes] = await Promise.all([getEventos(), getEmpleados()]);
      setEventos(evRes.data);
      setEmpleados(empRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openNew = () => { setEditando(null); setForm(emptyForm); setError(''); setModal(true); };

  const openEdit = (ev) => {
    setEditando(ev.id);
    setForm({
      titulo: ev.titulo || '', descripcion: ev.descripcion || '',
      empleado_id: ev.empleado_id || '',
      fecha_inicio: ev.fecha_inicio?.split('T')[0] || '',
      fecha_fin: ev.fecha_fin?.split('T')[0] || '',
      tipo: ev.tipo || 'otro',
    });
    setError('');
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, empleado_id: form.empleado_id ? Number(form.empleado_id) : null };
      if (editando) await updateEvento(editando, payload);
      else await crearEvento(payload);
      setModal(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este evento?')) return;
    try { await eliminarEvento(id); fetchAll(); }
    catch (e) { console.error(e); }
  };

  const setF = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Eventos de calendario</h1>
          <p className="text-gray-400 text-sm mt-0.5">Convenciones, viajes y eventos de varios días</p>
        </div>
        <button onClick={openNew}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo evento
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Cargando...</div>
        ) : eventos.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No hay eventos registrados</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {eventos.map((ev) => (
              <div key={ev.id} className="px-5 py-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium text-sm">{ev.titulo}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TIPO_COLOR[ev.tipo] || TIPO_COLOR.otro}`}>
                        {ev.tipo}
                      </span>
                    </div>
                    <p className="text-indigo-400 text-xs mt-0.5">
                      {fmtDate(ev.fecha_inicio?.split('T')[0])} — {fmtDate(ev.fecha_fin?.split('T')[0])}
                    </p>
                    {ev.empleado_nombre && <p className="text-gray-400 text-xs">Responsable: {ev.empleado_nombre}</p>}
                    {ev.descripcion && <p className="text-gray-500 text-xs mt-1 line-clamp-1">{ev.descripcion}</p>}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEdit(ev)} className="text-gray-400 hover:text-white text-xs transition-colors">Editar</button>
                    <button onClick={() => handleEliminar(ev.id)} className="text-gray-400 hover:text-red-400 text-xs transition-colors">Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editando ? 'Editar evento' : 'Nuevo evento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Título *</label>
            <input required value={form.titulo} onChange={(e) => setF('titulo', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Tipo</label>
            <select value={form.tipo} onChange={(e) => setF('tipo', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
              {TIPOS.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Empleado asignado</label>
            <select value={form.empleado_id} onChange={(e) => setF('empleado_id', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Sin asignar</option>
              {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre} {e.apellidos}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Fecha inicio *</label>
              <input required type="date" value={form.fecha_inicio} onChange={(e) => setF('fecha_inicio', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Fecha fin *</label>
              <input required type="date" value={form.fecha_fin} onChange={(e) => setF('fecha_fin', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => setF('descripcion', e.target.value)} rows={2}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-gray-500"
              placeholder="Detalles del evento..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
              {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
