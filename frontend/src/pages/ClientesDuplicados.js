import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDuplicadosClientes, fusionarClientes } from '../api';

function fmtFecha(d) {
  if (!d) return '—';
  return new Date(d.includes('T') ? d : d + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ClientesDuplicados() {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalGrupo, setModalGrupo] = useState(null);
  const [principalId, setPrincipalId] = useState(null);
  const [fusionando, setFusionando] = useState(false);
  const [msg, setMsg] = useState('');

  const cargarDuplicados = () => {
    setLoading(true);
    getDuplicadosClientes()
      .then(res => setGrupos(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargarDuplicados(); }, []);

  const openModal = (grupo) => {
    setModalGrupo(grupo);
    setPrincipalId(grupo.clientes[0]?.id);
    setMsg('');
  };

  const handleFusionar = async () => {
    if (!principalId) return;
    const duplicados_ids = modalGrupo.clientes
      .filter(c => c.id !== Number(principalId))
      .map(c => c.id);

    setFusionando(true);
    try {
      await fusionarClientes({ cliente_principal_id: Number(principalId), duplicados_ids });
      setModalGrupo(null);
      setMsg(`Clientes fusionados correctamente. ${duplicados_ids.length} registro(s) eliminado(s).`);
      cargarDuplicados();
    } catch (err) {
      setMsg('Error al fusionar: ' + (err.response?.data?.error || err.message));
    } finally {
      setFusionando(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/clientes')} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes duplicados</h1>
          <p className="text-gray-400 text-sm mt-0.5">Clientes con el mismo teléfono o email</p>
        </div>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm ${msg.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
          {msg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : grupos.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-white font-medium">No hay duplicados detectados</p>
          <p className="text-gray-500 text-sm mt-1">Todos los clientes tienen email y teléfono únicos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grupos.map((grupo, idx) => (
            <div key={idx} className="bg-gray-900 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  grupo.motivo === 'telefono'
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                }`}>
                  Duplicado por {grupo.motivo === 'telefono' ? 'teléfono' : 'email'}
                </span>
                <button onClick={() => openModal(grupo)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors">
                  Fusionar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {grupo.clientes.map(c => (
                  <div key={c.id} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-indigo-700/50 rounded-full flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                        {c.nombre?.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-white text-sm font-medium truncate">{c.nombre} {c.apellidos}</p>
                    </div>
                    <div className="space-y-0.5 text-xs text-gray-400">
                      {c.email && <p className="truncate">✉ {c.email}</p>}
                      {c.telefono && <p>📞 {c.telefono}</p>}
                      {c.fecha_nacimiento && <p>🎂 {fmtFecha(c.fecha_nacimiento)}</p>}
                      {Number(c.no_shows) > 0 && <p className="text-orange-400">⚠ {c.no_shows} no-shows</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal fusionar */}
      {modalGrupo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModalGrupo(null)} />
          <div className="relative z-10 bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Fusionar clientes</h2>
              <button onClick={() => setModalGrupo(null)} className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4 space-y-4">
              <p className="text-gray-400 text-sm">Elige el cliente principal que se mantendrá. Los demás serán eliminados y sus citas, consentimientos y ventas se moverán al principal.</p>

              <div className="space-y-2">
                {modalGrupo.clientes.map(c => (
                  <label key={c.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    Number(principalId) === c.id ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-gray-700/50 border-gray-700 hover:border-gray-600'
                  }`}>
                    <input type="radio" name="principal" value={c.id} checked={Number(principalId) === c.id}
                      onChange={() => setPrincipalId(c.id)}
                      className="mt-0.5 accent-indigo-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{c.nombre} {c.apellidos}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        {c.email && <span className="text-gray-400 text-xs">{c.email}</span>}
                        {c.telefono && <span className="text-gray-400 text-xs">{c.telefono}</span>}
                      </div>
                      {Number(principalId) === c.id && (
                        <span className="mt-1 inline-block text-xs text-indigo-400 font-medium">✓ Cliente principal</span>
                      )}
                      {Number(principalId) !== c.id && (
                        <span className="mt-1 inline-block text-xs text-red-400">Se eliminará</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg px-4 py-3">
                <p className="text-orange-400 text-xs">⚠ Esta acción no se puede deshacer. Los clientes marcados como "Se eliminará" serán borrados permanentemente.</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-700 flex gap-3">
              <button onClick={() => setModalGrupo(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleFusionar} disabled={fusionando}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                {fusionando ? 'Fusionando...' : 'Confirmar fusión'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
