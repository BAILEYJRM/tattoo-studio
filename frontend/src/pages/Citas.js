import React, { useEffect, useState, useCallback } from 'react';
import {
  getCitas, getClientes, getEmpleados, getCabinas,
  createCita, updateCita, updateCitaEstado,
  finalizarCita, getImagenesCita, subirImagenCita, getImagenUrl,
  enviarComunicacion,
} from '../api';
import Modal from '../components/Modal';

const ESTADOS = ['pendiente', 'confirmada', 'completada', 'cancelada'];
const ESTADO_CONFIG = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400' },
  confirmada: { label: 'Confirmada', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
  completada: { label: 'Completada', color: 'bg-green-500/10 text-green-400 border-green-500/20', dot: 'bg-green-400' },
  cancelada: { label: 'Cancelada', color: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
};
const FORMAS_PAGO = ['efectivo', 'tarjeta', 'bizum', 'transferencia'];

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.pendiente;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={onChange}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-600'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  );
}

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
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => onMonthChange(-1)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-white font-semibold text-sm">{monthNames[month]} {year}</span>
        <button onClick={() => onMonthChange(1)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((d) => <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const daysCitas = citasByDate[dateStr] || [];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`relative aspect-square flex flex-col items-center justify-start pt-1 rounded-lg text-xs transition-colors ${
                isSelected ? 'bg-indigo-600 text-white' : isToday ? 'bg-indigo-600/20 text-indigo-400 font-bold' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span>{day}</span>
              {daysCitas.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                  {daysCitas.slice(0, 3).map((c, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : (c.artista_color || '#6366f1') }}
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
  cliente_id: '', artista_id: '', cabina_id: '',
  fecha: '', hora_inicio: '', hora_fin: '',
  descripcion: '', precio: '', estado: 'pendiente',
  importe_senal: '', senal_cobrada: false,
  forma_pago: '', notas_internas: '',
};

const emptyFinalizar = {
  normal: true, no_presentado: false,
  forma_pago: 'efectivo', precio_final: '', comision_artista: '',
};

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cabinas, setCabinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('lista');
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filtroEstado, setFiltroEstado] = useState('');

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [citaFinalizar, setCitaFinalizar] = useState(null);
  const [formFinalizar, setFormFinalizar] = useState(emptyFinalizar);
  const [savingFinalizar, setSavingFinalizar] = useState(false);

  const [modalImagenes, setModalImagenes] = useState(false);
  const [citaImagenes, setCitaImagenes] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [loadingImagenes, setLoadingImagenes] = useState(false);
  const [uploadTipo, setUploadTipo] = useState('referencia');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [citasRes, clientesRes, empleadosRes, cabinasRes] = await Promise.all([
        getCitas(), getClientes(), getEmpleados(), getCabinas(),
      ]);
      setCitas(citasRes.data);
      setClientes(clientesRes.data);
      setEmpleados(empleadosRes.data);
      setCabinas(cabinasRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
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
      cabina_id: cita.cabina_id || '',
      fecha: cita.fecha?.split('T')[0] || '',
      hora_inicio: cita.hora_inicio?.slice(0, 5) || '',
      hora_fin: cita.hora_fin?.slice(0, 5) || '',
      descripcion: cita.descripcion || '',
      precio: cita.precio || '',
      estado: cita.estado || 'pendiente',
      importe_senal: cita.importe_senal || '',
      senal_cobrada: cita.senal_cobrada || false,
      forma_pago: cita.forma_pago || '',
      notas_internas: cita.notas_internas || '',
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
        importe_senal: form.importe_senal ? Number(form.importe_senal) : 0,
        cliente_id: Number(form.cliente_id),
        artista_id: Number(form.artista_id),
        cabina_id: form.cabina_id ? Number(form.cabina_id) : null,
      };
      if (editando) await updateCita(editando, payload);
      else await createCita(payload);
      setModal(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleEstado = async (id, estado) => {
    try { await updateCitaEstado(id, estado); fetchAll(); }
    catch (e) { console.error(e); }
  };

  const openFinalizar = (cita) => {
    setCitaFinalizar(cita);
    setFormFinalizar({ ...emptyFinalizar, precio_final: cita.precio || '' });
    setModalFinalizar(true);
  };

  const handleFinalizar = async (e) => {
    e.preventDefault();
    setSavingFinalizar(true);
    try {
      await finalizarCita(citaFinalizar.id, {
        forma_pago: formFinalizar.forma_pago,
        precio_final: formFinalizar.precio_final ? Number(formFinalizar.precio_final) : null,
        comision_artista: formFinalizar.comision_artista ? Number(formFinalizar.comision_artista) : null,
        no_presentado: formFinalizar.no_presentado,
      });
      setModalFinalizar(false);
      fetchAll();
    } catch (e) { console.error(e); }
    finally { setSavingFinalizar(false); }
  };

  const openImagenes = async (cita) => {
    setCitaImagenes(cita);
    setModalImagenes(true);
    setUploadFile(null);
    setUploadTipo('referencia');
    setLoadingImagenes(true);
    try {
      const res = await getImagenesCita(cita.id);
      setImagenes(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingImagenes(false); }
  };

  const handleSubirImagen = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append('imagen', uploadFile);
      fd.append('tipo', uploadTipo);
      await subirImagenCita(citaImagenes.id, fd);
      const res = await getImagenesCita(citaImagenes.id);
      setImagenes(res.data);
      setUploadFile(null);
    } catch (e) { console.error(e); }
    finally { setUploadingImg(false); }
  };

  const handleEnviarRecordatorio = async (cita) => {
    setEnviandoEmail(cita.id);
    try {
      await enviarComunicacion({ tipo: 'recordatorio_cita', cita_id: cita.id });
    } catch (e) { console.error(e); }
    finally { setEnviandoEmail(null); }
  };

  const handleMonthChange = (dir) => {
    setCurrentMonth((m) => { const n = new Date(m); n.setMonth(n.getMonth() + dir); return n; });
  };

  const citasFiltradas = citas.filter((c) => {
    if (filtroEstado && c.estado !== filtroEstado) return false;
    if (selectedDate && c.fecha?.split('T')[0] !== selectedDate) return false;
    return true;
  });

  const TIPOS_IMG = ['referencia', 'proceso', 'resultado'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Citas</h1>
        <button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva cita
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-gray-900 p-1 rounded-lg">
          {['lista','calendario'].map((v) => (
            <button key={v} onClick={() => setVista(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${vista === v ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
              {v === 'lista' ? 'Lista' : 'Calendario'}
            </button>
          ))}
        </div>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
          className="bg-gray-900 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>)}
        </select>
        {selectedDate && (
          <button onClick={() => setSelectedDate(null)} className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </button>
        )}
      </div>

      {vista === 'calendario' && (
        <Calendar citas={citas} selectedDate={selectedDate} onSelectDate={setSelectedDate}
          currentMonth={currentMonth} onMonthChange={handleMonthChange} />
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
                  {/* Artista color bar + date */}
                  <div className="flex items-stretch gap-2 min-w-[60px]">
                    <div className="w-1 rounded-full flex-shrink-0" style={{ backgroundColor: cita.artista_color || '#6366f1' }} />
                    <div className="text-center bg-gray-800 rounded-lg px-2 py-2 flex-1">
                      <p className="text-indigo-400 text-xs font-medium">
                        {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase()}
                      </p>
                      <p className="text-white text-sm font-bold mt-0.5">{cita.hora_inicio?.slice(0, 5)}</p>
                      <p className="text-gray-500 text-xs">{cita.hora_fin?.slice(0, 5)}</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium text-sm">{cita.cliente_nombre}</p>
                      <EstadoBadge estado={cita.estado} />
                      {cita.cliente_conflictivo && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">⚠ Conflictivo</span>
                      )}
                      {cita.cabina_nombre && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 border border-gray-600">{cita.cabina_nombre}</span>
                      )}
                      {Number(cita.importe_senal) > 0 && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cita.senal_cobrada ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                          Señal {cita.senal_cobrada ? '✓' : '⏳'} {Number(cita.importe_senal).toFixed(0)}€
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">Artista: {cita.artista_nombre}</p>
                    {cita.descripcion && <p className="text-gray-500 text-xs mt-1 line-clamp-1">{cita.descripcion}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2">
                    {cita.precio && (
                      <span className="text-white font-semibold text-sm">{Number(cita.precio).toFixed(2)}€</span>
                    )}
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <button onClick={() => openEdit(cita)} className="text-gray-400 hover:text-white text-xs transition-colors">Editar</button>
                      <button onClick={() => openImagenes(cita)} className="text-purple-400 hover:text-purple-300 text-xs transition-colors">Imágenes</button>
                      {(cita.estado === 'pendiente' || cita.estado === 'confirmada') && (
                        <button
                          onClick={() => handleEnviarRecordatorio(cita)}
                          disabled={enviandoEmail === cita.id}
                          className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors disabled:opacity-50"
                        >
                          {enviandoEmail === cita.id ? 'Enviando...' : '✉ Recordatorio'}
                        </button>
                      )}
                      {cita.estado === 'pendiente' && (
                        <button onClick={() => handleEstado(cita.id, 'confirmada')} className="text-blue-400 hover:text-blue-300 text-xs transition-colors">Confirmar</button>
                      )}
                      {(cita.estado === 'pendiente' || cita.estado === 'confirmada') && (
                        <>
                          <button onClick={() => openFinalizar(cita)} className="text-green-400 hover:text-green-300 text-xs transition-colors font-medium">Finalizar</button>
                          <button onClick={() => handleEstado(cita.id, 'cancelada')} className="text-red-400 hover:text-red-300 text-xs transition-colors">Cancelar</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editando ? 'Editar cita' : 'Nueva cita'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Cliente *</label>
              <select value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })} required
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Seleccionar cliente</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre} {c.apellidos}{c.conflictivo ? ' ⚠' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Artista *</label>
              <select value={form.artista_id} onChange={(e) => setForm({ ...form, artista_id: e.target.value })} required
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Seleccionar artista</option>
                {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre} {e.apellidos}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Cabina</label>
            <select value={form.cabina_id} onChange={(e) => setForm({ ...form, cabina_id: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Sin cabina asignada</option>
              {cabinas.filter(c => c.activo).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Fecha *</label>
            <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Hora inicio *</label>
              <input type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} required
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Hora fin *</label>
              <input type="time" value={form.hora_fin} onChange={(e) => setForm({ ...form, hora_fin: e.target.value })} required
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-gray-500"
              placeholder="Diseño, zona del tatuaje..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Precio</label>
              <input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })}
                step="0.01" min="0" placeholder="0.00"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Señal (€)</label>
              <input type="number" value={form.importe_senal} onChange={(e) => setForm({ ...form, importe_senal: e.target.value })}
                step="0.01" min="0" placeholder="0.00"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Forma de pago</label>
              <select value={form.forma_pago} onChange={(e) => setForm({ ...form, forma_pago: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Sin especificar</option>
                {FORMAS_PAGO.map((f) => <option key={f} value={f} className="capitalize">{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            {editando && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Estado</label>
                <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                  {ESTADOS.map((e) => <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>)}
                </select>
              </div>
            )}
          </div>

          <Toggle label="Señal cobrada" checked={form.senal_cobrada} onChange={() => setForm({ ...form, senal_cobrada: !form.senal_cobrada })} />

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Notas internas</label>
            <textarea value={form.notas_internas} onChange={(e) => setForm({ ...form, notas_internas: e.target.value })} rows={2}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-gray-500"
              placeholder="Visibles solo para el equipo..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
              {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal finalizar */}
      <Modal isOpen={modalFinalizar} onClose={() => setModalFinalizar(false)} title="Finalizar cita">
        {citaFinalizar && (
          <form onSubmit={handleFinalizar} className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg px-4 py-3">
              <p className="text-white text-sm font-medium">{citaFinalizar.cliente_nombre}</p>
              <p className="text-gray-400 text-xs">{new Date(citaFinalizar.fecha + 'T00:00:00').toLocaleDateString('es-ES')} · {citaFinalizar.hora_inicio?.slice(0,5)} - {citaFinalizar.hora_fin?.slice(0,5)}</p>
            </div>

            <div className="space-y-3">
              <Toggle
                label="La cita transcurrió con normalidad"
                checked={formFinalizar.normal}
                onChange={() => setFormFinalizar((f) => ({ ...f, normal: !f.normal, no_presentado: f.normal ? false : f.no_presentado }))}
              />
              <Toggle
                label="Cliente no se presentó (no-show)"
                checked={formFinalizar.no_presentado}
                onChange={() => setFormFinalizar((f) => ({ ...f, no_presentado: !f.no_presentado, normal: f.no_presentado ? true : false }))}
              />
            </div>

            {!formFinalizar.no_presentado && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Forma de pago *</label>
                  <select value={formFinalizar.forma_pago} onChange={(e) => setFormFinalizar({ ...formFinalizar, forma_pago: e.target.value })} required
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                    {FORMAS_PAGO.map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Precio final (€)</label>
                    <input type="number" value={formFinalizar.precio_final}
                      onChange={(e) => setFormFinalizar({ ...formFinalizar, precio_final: e.target.value })}
                      step="0.01" min="0" placeholder="0.00"
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Comisión artista (%)</label>
                    <input type="number" value={formFinalizar.comision_artista}
                      onChange={(e) => setFormFinalizar({ ...formFinalizar, comision_artista: e.target.value })}
                      step="0.01" min="0" max="100" placeholder="0"
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalFinalizar(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={savingFinalizar}
                className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                {savingFinalizar ? 'Guardando...' : 'Finalizar cita'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal imágenes */}
      <Modal isOpen={modalImagenes} onClose={() => setModalImagenes(false)} title={`Imágenes — ${citaImagenes?.cliente_nombre || ''}`}>
        <div className="space-y-5">
          {loadingImagenes ? (
            <div className="text-center py-6 text-gray-500 text-sm">Cargando...</div>
          ) : (
            TIPOS_IMG.map((tipo) => {
              const imgs = imagenes.filter((i) => i.tipo === tipo);
              if (imgs.length === 0) return null;
              return (
                <div key={tipo}>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-2">{tipo}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {imgs.map((img) => (
                      <a key={img.id} href={getImagenUrl(img.imagen_path)} target="_blank" rel="noreferrer">
                        <img src={getImagenUrl(img.imagen_path)} alt={tipo}
                          className="w-full h-24 object-cover rounded-lg hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })
          )}
          {!loadingImagenes && imagenes.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">No hay imágenes todavía</p>
          )}

          <form onSubmit={handleSubirImagen} className="border-t border-gray-700 pt-4 space-y-3">
            <p className="text-sm text-gray-400 font-medium">Subir imagen</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                <select value={uploadTipo} onChange={(e) => setUploadTipo(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                  {TIPOS_IMG.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Archivo</label>
                <input type="file" accept="image/*" capture="environment"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full text-gray-300 text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-gray-600 file:text-white hover:file:bg-gray-500" />
              </div>
            </div>
            {uploadFile && (
              <img src={URL.createObjectURL(uploadFile)} alt="preview"
                className="w-full h-32 object-cover rounded-lg" />
            )}
            <button type="submit" disabled={!uploadFile || uploadingImg}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
              {uploadingImg ? 'Subiendo...' : 'Subir imagen'}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}
