import React, { useEffect, useState } from 'react';
import { 
  getSuperAdminStats, 
  getSuperAdminEstudios, 
  updateEstudioPlan, 
  updateEstudioEstado, 
  ampliarPruebaEstudio, 
  resetEstudioPassword 
} from '../api';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  Zap,
  Sliders
} from 'lucide-react';

export default function SuperAdmin() {
  const [stats, setStats] = useState(null);
  const [estudios, setEstudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  
  // Modals & Forms
  const [modalEstudio, setModalEstudio] = useState(null); // estudio objeto
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [mensajeConfirm, setMensajeConfirm] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resStats, resEstudios] = await Promise.all([
        getSuperAdminStats(),
        getSuperAdminEstudios()
      ]);
      setStats(resStats.data);
      setEstudios(resEstudios.data);
    } catch (err) {
      console.error('Error al cargar datos de SuperAdmin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCambiarPlan = async (estudioId, plan) => {
    try {
      await updateEstudioPlan(estudioId, plan);
      setMensajeConfirm(`Plan actualizado a ${plan.toUpperCase()}`);
      setTimeout(() => setMensajeConfirm(''), 3000);
      cargarDatos();
    } catch (err) {
      alert('Error al cambiar plan: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleEstado = async (estudioId, estadoActual) => {
    const nuevoEstado = estadoActual === 'activo' ? 'suspendido' : 'activo';
    if (!window.confirm(`¿Estás seguro de cambiar el estado a ${nuevoEstado.toUpperCase()}?`)) return;
    try {
      await updateEstudioEstado(estudioId, nuevoEstado);
      setMensajeConfirm(`Estudio ${nuevoEstado === 'activo' ? 'activado' : 'suspendido'} con éxito.`);
      setTimeout(() => setMensajeConfirm(''), 3000);
      cargarDatos();
    } catch (err) {
      alert('Error al cambiar estado: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAmpliarPrueba = async (estudioId) => {
    try {
      await ampliarPruebaEstudio(estudioId, 14);
      setMensajeConfirm('Prueba gratis ampliada por +14 días.');
      setTimeout(() => setMensajeConfirm(''), 3000);
      cargarDatos();
    } catch (err) {
      alert('Error al ampliar prueba: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!modalEstudio || !newPasswordInput) return;
    try {
      const res = await resetEstudioPassword(modalEstudio.id, newPasswordInput);
      alert(res.data.mensaje);
      setModalEstudio(null);
      setNewPasswordInput('');
    } catch (err) {
      alert('Error al restablecer contraseña: ' + (err.response?.data?.error || err.message));
    }
  };

  const estudiosFiltrados = estudios.filter(e => {
    const cumpleBusqueda = e.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
                          e.email_admin?.toLowerCase().includes(busqueda.toLowerCase());
    if (filtroEstado === 'todos') return cumpleBusqueda;
    if (filtroEstado === 'activos') return cumpleBusqueda && e.estado === 'activo';
    if (filtroEstado === 'suspendidos') return cumpleBusqueda && e.estado === 'suspendido';
    return cumpleBusqueda;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-gray-900 min-h-screen text-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-red-500" /> Panel SuperAdmin SaaS
            </h1>
            <span className="bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
              Propietario Platform
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1 font-medium">
            Control global de suscripciones, métricas MRR y estado de estudios registrados en KuroIchi.
          </p>
        </div>

        <button
          onClick={cargarDatos}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-gray-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar Métricas
        </button>
      </div>

      {mensajeConfirm && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 rounded-xl text-sm font-bold animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {mensajeConfirm}
        </div>
      )}

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800/80 border border-gray-700/60 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">MRR Estimado</span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.mrr_estimado}€<span className="text-xs text-gray-500 font-bold ml-1">/mes</span></div>
            <div className="text-[10px] text-emerald-400 font-bold uppercase mt-1">Suscripciones Recurrentes</div>
          </div>

          <div className="bg-gray-800/80 border border-gray-700/60 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Estudios Totales</span>
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.total_estudios}</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Registrados en Plataforma</div>
          </div>

          <div className="bg-gray-800/80 border border-gray-700/60 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Estudios Activos</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">{stats.activos}</div>
            <div className="text-[10px] text-emerald-500/80 font-bold uppercase mt-1">Con Acceso Habilitado</div>
          </div>

          <div className="bg-gray-800/80 border border-gray-700/60 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Prueba Gratis</span>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{stats.en_prueba}</div>
            <div className="text-[10px] text-amber-500/80 font-bold uppercase mt-1">14 Días Activos</div>
          </div>

          <div className="bg-gray-800/80 border border-gray-700/60 rounded-2xl p-5 shadow-lg col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Total Tatuadores</span>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.total_artistas}</div>
            <div className="text-[10px] text-purple-400 font-bold uppercase mt-1">Artistas Operativos</div>
          </div>
        </div>
      )}

      {/* Control & Table Section */}
      <div className="bg-gray-800/60 border border-gray-700/60 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por nombre de estudio o email..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 placeholder-gray-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-gray-400" />
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-red-500"
            >
              <option value="todos">Todos los Estados</option>
              <option value="activos">Solo Activos</option>
              <option value="suspendidos">Solo Suspendidos</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-2xl border border-gray-700/50">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/80 text-xs uppercase font-bold text-gray-400 border-b border-gray-700">
              <tr>
                <th className="p-4">Estudio</th>
                <th className="p-4">Admin Email</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Artistas</th>
                <th className="p-4">Citas</th>
                <th className="p-4">Prueba Termina</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-900/40">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 font-bold text-xs uppercase">
                    Cargando lista de estudios...
                  </td>
                </tr>
              ) : estudiosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 font-bold text-xs uppercase">
                    No se encontraron estudios
                  </td>
                </tr>
              ) : (
                estudiosFiltrados.map((e) => {
                  const enPrueba = e.trial_ends_at && new Date(e.trial_ends_at) > new Date();
                  return (
                    <tr key={e.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-red-500 shrink-0" />
                        <div>
                          <div>{e.nombre}</div>
                          <div className="text-[10px] text-gray-500 font-mono">ID: #{e.id}</div>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono text-gray-300">{e.email_admin}</td>
                      <td className="p-4">
                        <select
                          value={e.plan || 'mensual'}
                          onChange={(evt) => handleCambiarPlan(e.id, evt.target.value)}
                          className="bg-gray-800 border border-gray-700 text-xs font-bold rounded-lg px-2.5 py-1 text-amber-300 focus:outline-none focus:border-amber-500"
                        >
                          <option value="mensual">PRO Mensual (50€)</option>
                          <option value="semestral">PRO Semestral (250€)</option>
                          <option value="anual">PRO Anual (450€)</option>
                          <option value="basico">Starter (29€)</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          e.estado === 'activo' 
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' 
                            : 'bg-red-950/60 text-red-400 border-red-500/40'
                        }`}>
                          {e.estado === 'activo' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {e.estado}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs font-bold text-white">{e.total_empleados}</td>
                      <td className="p-4 font-mono text-xs font-bold text-gray-400">{e.total_citas}</td>
                      <td className="p-4 text-xs font-mono">
                        {e.trial_ends_at ? (
                          <span className={enPrueba ? 'text-amber-400 font-bold' : 'text-gray-500'}>
                            {new Date(e.trial_ends_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleAmpliarPrueba(e.id)}
                          className="px-2.5 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-600/40 rounded-lg text-[10px] font-extrabold uppercase transition-colors"
                          title="Ampliar prueba +14 días"
                        >
                          +14 Días
                        </button>

                        <button
                          onClick={() => handleToggleEstado(e.id, e.estado)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase border transition-colors ${
                            e.estado === 'activo'
                              ? 'bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-600/40'
                              : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-600/40'
                          }`}
                        >
                          {e.estado === 'activo' ? 'Suspender' : 'Activar'}
                        </button>

                        <button
                          onClick={() => setModalEstudio(e)}
                          className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg transition-colors"
                          title="Restablecer contraseña de admin"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Restablecer Clave Admin */}
      {modalEstudio && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl max-w-md w-full p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" /> Restablecer Clave Admin
              </h3>
              <button onClick={() => setModalEstudio(null)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Estudio: <strong className="text-white">{modalEstudio.nombre}</strong><br />
                Admin: <span className="font-mono text-gray-300">{modalEstudio.email_admin}</span>
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Nueva Contraseña *</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Nuevapass123!"
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEstudio(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg"
                >
                  Guardar Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
