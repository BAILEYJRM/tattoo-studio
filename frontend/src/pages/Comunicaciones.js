import React, { useState, useEffect, useCallback } from 'react';
import {
  getComunicaciones, getPlantillasComunicacion, updatePlantillaComunicacion,
  getEstadisticasComunicaciones,
} from '../api';

const TIPO_LABELS = {
  confirmacion_cita: 'Confirmación cita',
  recordatorio_cita: 'Recordatorio cita',
  cuidados_tatuaje: 'Cuidados tatuaje',
  cuidados_piercing: 'Cuidados piercing',
  cumpleanos: 'Cumpleaños',
  consentimiento_firmado: 'Consentimiento',
};

const VARIABLES_POR_TIPO = {
  confirmacion_cita: ['cliente_nombre','fecha','hora_inicio','hora_fin','artista_nombre','cabina_nombre','precio','politica_cancelacion','estudio'],
  recordatorio_cita: ['cliente_nombre','fecha','hora_inicio','artista_nombre','estudio'],
  cuidados_tatuaje: ['cliente_nombre','estudio'],
  cuidados_piercing: ['cliente_nombre','estudio'],
  cumpleanos: ['cliente_nombre','estudio'],
  consentimiento_firmado: ['cliente_nombre','fecha','estudio'],
};

function EstadoBadge({ estado }) {
  const ok = estado === 'enviado';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
      ok ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-400' : 'bg-red-400'}`} />
      {ok ? 'Enviado' : 'Error'}
    </span>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange} className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-600'}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-white'}`}>{value}</p>
    </div>
  );
}

// ── Pestaña Historial ─────────────────────────────────────────────────────────
function TabHistorial() {
  const [comunicaciones, setComunicaciones] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtroTipo) params.tipo = filtroTipo;
      if (filtroEstado) params.estado = filtroEstado;
      const [comRes, statsRes] = await Promise.all([
        getComunicaciones(params),
        getEstadisticasComunicaciones(),
      ]);
      setComunicaciones(comRes.data);
      setStats(statsRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filtroTipo, filtroEstado]);

  useEffect(() => { cargar(); }, [cargar]);

  const fmtFecha = (d) => d ? new Date(d).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="space-y-5">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Enviados hoy" value={stats.enviados_hoy} />
          <StatCard label="Esta semana" value={stats.enviados_semana} />
          <StatCard label="Este mes" value={stats.enviados_mes} />
          <StatCard label="Tasa de éxito" value={`${stats.tasa_exito}%`} color="text-green-400" />
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
          className="bg-gray-900 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Todos los tipos</option>
          {Object.entries(TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
          className="bg-gray-900 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Todos los estados</option>
          <option value="enviado">Enviado</option>
          <option value="error">Error</option>
          <option value="pendiente">Pendiente</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Cargando...</div>
        ) : comunicaciones.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No hay comunicaciones registradas</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Fecha','Tipo','Destinatario','Asunto','Estado'].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comunicaciones.map((c) => (
                  <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{fmtFecha(c.enviado_en || c.created_at)}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{TIPO_LABELS[c.tipo] || c.tipo}</span>
                    </td>
                    <td className="px-4 py-2.5 text-white">{c.destinatario}</td>
                    <td className="px-4 py-2.5 text-gray-400 max-w-[220px] truncate">{c.asunto}</td>
                    <td className="px-4 py-2.5"><EstadoBadge estado={c.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pestaña Plantillas ────────────────────────────────────────────────────────
function TabPlantillas() {
  const [plantillas, setPlantillas] = useState([]);
  const [editando, setEditando] = useState(null); // plantilla completa
  const [form, setForm] = useState({ asunto: '', contenido: '', activa: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPlantillasComunicacion()
      .then((r) => setPlantillas(r.data))
      .catch(console.error);
  }, []);

  const abrirEditor = (p) => {
    setEditando(p);
    setForm({ asunto: p.asunto || '', contenido: p.contenido || '', activa: p.activa });
    setSaved(false);
  };

  const insertarVariable = (v) => {
    setForm((f) => ({ ...f, contenido: f.contenido + `{{${v}}}` }));
  };

  const guardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updatePlantillaComunicacion(editando.id, form);
      setPlantillas((prev) => prev.map((p) => p.id === editando.id ? res.data : p));
      setEditando(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Lista plantillas */}
      <div className="space-y-2">
        {plantillas.map((p) => (
          <button
            key={p.id}
            onClick={() => abrirEditor(p)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
              editando?.id === p.id
                ? 'bg-indigo-600/20 border-indigo-500/40 text-white'
                : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{TIPO_LABELS[p.tipo] || p.tipo}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${p.activa ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                {p.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{p.asunto}</p>
          </button>
        ))}
      </div>

      {/* Editor */}
      {editando ? (
        <form onSubmit={guardar} className="lg:col-span-2 bg-gray-900 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">{TIPO_LABELS[editando.tipo] || editando.tipo}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Activa</span>
              <Toggle checked={form.activa} onChange={() => setForm((f) => ({ ...f, activa: !f.activa }))} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Asunto</label>
            <input type="text" value={form.asunto} onChange={(e) => setForm({ ...form, asunto: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Contenido</label>
            <textarea
              value={form.contenido}
              onChange={(e) => setForm({ ...form, contenido: e.target.value })}
              rows={10}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono resize-none"
            />
          </div>

          {/* Variables disponibles */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Variables disponibles (clic para insertar):</p>
            <div className="flex flex-wrap gap-1.5">
              {(VARIABLES_POR_TIPO[editando.tipo] || []).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertarVariable(v)}
                  className="text-xs bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full hover:bg-indigo-600/40 transition-colors font-mono"
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
              {saving ? 'Guardando...' : 'Guardar plantilla'}
            </button>
            {saved && <span className="text-green-400 text-sm">✓ Guardado</span>}
          </div>
        </form>
      ) : (
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-12 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Selecciona una plantilla para editarla</p>
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Comunicaciones() {
  const [tab, setTab] = useState('historial');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Comunicaciones</h1>
        <p className="text-gray-400 text-sm mt-0.5">Emails automáticos y plantillas editables</p>
      </div>

      <div className="flex gap-1 bg-gray-900 p-1 rounded-lg w-fit">
        {[['historial','Historial'],['plantillas','Plantillas']].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === k ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'historial' ? <TabHistorial /> : <TabPlantillas />}
    </div>
  );
}
