import React, { useEffect, useState, useCallback } from 'react';
import { getCitas, getClientes, getEmpleados, createCita, updateCita, updateCitaEstado } from '../api';
import Modal from '../components/Modal';

const ESTADOS = ['pendiente', 'confirmada', 'completada', 'cancelada'];

const ESTADO_CONFIG = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400' },
  confirmada: { label: 'Confirmada', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
  completada: { label: 'Completada', color: 'bg-green-500/10 text-green-400 border-green-500/20', dot: 'bg-green-400' },
  cancelada: { label: 'Cancelada', color: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
};

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.pendiente;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// Minimal calendar component
function Calendar({ citas, selectedDate, onSelectDate, currentMonth, onMonthChange }) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const citasByDate = {};
  citas.forEach((c) => {
    const key = c.fecha?.split('T')[0];
    if (!citasByDate[key]) citasByDate[key] = [];
    citasByDate[key].push(c);
  });

  const today = new Date().toISOString().split('T')[0];

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-gray-900 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(-1)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-white font-semibold text-sm">
          {monthNames[month]} {year}
        </span>
        <button
          onClick={() => onMonthChange(1)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const daysCitas = citasByDate[dateStr] || [];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`relative aspect-square flex flex-col items-center justify-start pt-1 rounded-lg text-xs transition-colors ${
                isSelected
                  ? 'bg-indigo-600 text-white'
                  : isToday
                  ? 'bg-indigo-600/20 text-indigo-400 font-bold'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span>{day}</span>
              {daysCitas.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                  {daysCitas.slice(0, 3).map((c, i) => (
                    <span
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white/70' : ESTADO_CONFIG[c.estado]?.dot || 'bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const emptyForm = {
  cliente_id: '',
  artista_id: '',
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
  descripcion: '',
  precio: '',
  estado: 'pendiente',
};

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('lista'); // 'lista' | 'calendario'
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [citasRes, clientesRes, empleadosRes] = await Promise.all([
        getCitas(),
        getClientes(),
        getEmpleados(),
      ]);
      setCitas(citasRes.data);
      setClientes(clientesRes.data);
      setEmpleados(empleadosRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openNew = () => {
    setEditando(null);
    setForm({ ...emptyForm, fecha: selectedDate || '' });
    setError('');
    setModal(true);
  };

  const openEdit = (cita) => {
    setEditando(cita.id);
    setForm({
      cliente_id: cita.cliente_id || '',
      artista_id: cita.artista_id || '',
      fecha: cita.fecha?.split('T')[0] || '',
      hora_inicio: cita.hora_inicio?.slice(0, 5) || '',
      hora_fin: cita.hora_fin?.slice(0, 5) || '',
      descripcion: cita.descripcion || '',
      precio: cita.precio || '',
      estado: cita.estado || 'pendiente',
    });
    setError('');
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        hora_inicio: form.hora_inicio + ':00',
        hora_fin: form.hora_fin + ':00',
        precio: form.precio ? Number(form.precio) : null,
        cliente_id: Number(form.cliente_id),
        artista_id: Number(form.artista_id),
      };
      if (editando) {
        await updateCita(editando, payload);
      } else {
        await createCita(payload);
      }
      setModal(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEstado = async (id, estado) => {
    try {
      await updateCitaEstado(id, estado);
      fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMonthChange = (dir) => {
    setCurrentMonth((m) => {
      const next = new Date(m);
      next.setMonth(next.getMonth() + dir);
      return next;
    });
  };

  const citasFiltradas = citas.filter((c) => {
    if (filtroEstado && c.estado !== filtroEstado) return false;
    if (selectedDate && c.fecha?.split('T')[0] !== selectedDate) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Citas</h1>
        <button
          onClick={openNew}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva cita
        </button>
      </div>

      {/* Filters & view toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-gray-900 p-1 rounded-lg">
          <button
            onClick={() => setVista('lista')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              vista === 'lista' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setVista('calendario')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              vista === 'calendario' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Calendario
          </button>
        </div>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="bg-gray-900 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>
          ))}
        </select>

        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </button>
        )}
      </div>

      {/* Calendar view */}
      {vista === 'calendario' && (
        <Calendar
          citas={citas}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
        />
      )}

      {/* List */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Cargando...</div>
        ) : citasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            {selectedDate || filtroEstado ? 'No hay citas con esos filtros' : 'No hay citas registradas'}
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {citasFiltradas.map((cita) => (
              <div key={cita.id} className="px-5 py-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Date/time */}
                  <div className="text-center min-w-[60px] bg-gray-800 rounded-lg px-2 py-2">
                    <p className="text-indigo-400 text-xs font-medium">
                      {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase()}
                    </p>
                    <p className="text-white text-sm font-bold mt-0.5">{cita.hora_inicio?.slice(0, 5)}</p>
                    <p className="text-gray-500 text-xs">{cita.hora_fin?.slice(0, 5)}</p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium text-sm">{cita.cliente_nombre}</p>
                      <EstadoBadge estado={cita.estado} />
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Artista: {cita.artista_nombre}
                    </p>
                    {cita.descripcion && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-1">{cita.descripcion}</p>
                    )}
                  </div>

                  {/* Price & actions */}
                  <div className="flex flex-col items-end gap-2">
                    {cita.precio && (
                      <span className="text-white font-semibold text-sm">
                        ${Number(cita.precio).toFixed(2)}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(cita)}
                        className="text-gray-400 hover:text-white text-xs transition-colors"
                      >
                        Editar
                      </button>
                      {cita.estado === 'pendiente' && (
                        <button
                          onClick={() => handleEstado(cita.id, 'confirmada')}
                          className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                        >
                          Confirmar
                        </button>
                      )}
                      {cita.estado === 'confirmada' && (
                        <button
                          onClick={() => handleEstado(cita.id, 'completada')}
                          className="text-green-400 hover:text-green-300 text-xs transition-colors"
                        >
                          Completar
                        </button>
                      )}
                      {(cita.estado === 'pendiente' || cita.estado === 'confirmada') && (
                        <button
                          onClick={() => handleEstado(cita.id, 'cancelada')}
                          className="text-red-400 hover:text-red-300 text-xs transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editando ? 'Editar cita' : 'Nueva cita'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Cliente *</label>
            <select
              value={form.cliente_id}
              onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
              required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} {c.apellidos}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Artista *</label>
            <select
              value={form.artista_id}
              onChange={(e) => setForm({ ...form, artista_id: e.target.value })}
              required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar artista</option>
              {empleados.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre} {e.apellidos}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Fecha *</label>
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Hora inicio *</label>
              <input
                type="time"
                value={form.hora_inicio}
                onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                required
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Hora fin *</label>
              <input
                type="time"
                value={form.hora_fin}
                onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
                required
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={2}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-gray-500"
              placeholder="Diseño, zona del tatuaje..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Precio</label>
              <input
                type="number"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                step="0.01"
                min="0"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                placeholder="0.00"
              />
            </div>
            {editando && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
