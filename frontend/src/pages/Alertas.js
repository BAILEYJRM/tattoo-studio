import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getAlertas, scanAlertas, resolverAlerta } from '../api';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, Calendar, Package } from 'lucide-react';

export default function Alertas() {
  const { t } = useLanguage();
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('pendiente'); // 'pendiente', 'resuelta', 'todas'
  const [filtroTipo, setFiltroTipo] = useState('todas'); // 'todas', 'criticas', 'stock', 'caducidad'

  const cargarAlertas = async () => {
    setLoading(true);
    try {
      await scanAlertas(); // Escanear nuevas alertas antes de cargar
      const res = await getAlertas();
      setAlertas(res.data);
    } catch (error) {
      console.error('Error cargando alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAlertas();
  }, []);

  const handleResolver = async (id) => {
    try {
      await resolverAlerta(id);
      cargarAlertas();
    } catch (error) {
      console.error('Error resolviendo alerta:', error);
    }
  };

  // Filtrado
  const alertasFiltradas = alertas.filter(a => {
    if (filtroEstado !== 'todas') {
      if (a.estado !== filtroEstado) return false;
    }
    if (filtroTipo !== 'todas') {
      if (filtroTipo === 'criticas' && a.gravedad !== 'critica') return false;
      if (filtroTipo === 'stock' && a.tipo !== 'stock') return false;
      if (filtroTipo === 'caducidad' && a.tipo !== 'caducidad') return false;
    }
    return true;
  });

  const countPendientes = alertas.filter(a => a.estado === 'pendiente').length;
  const countResueltas = alertas.filter(a => a.estado === 'resuelta').length;
  const countTodas = alertas.length;

  const countCriticas = alertas.filter(a => a.estado === filtroEstado && a.gravedad === 'critica').length;
  const countStock = alertas.filter(a => a.estado === filtroEstado && a.tipo === 'stock').length;
  const countCaducidad = alertas.filter(a => a.estado === filtroEstado && a.tipo === 'caducidad').length;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">{t('alertas')}</h1>
        <p className="text-gray-400">{countPendientes} {t('alertas_pendientes')}</p>
      </div>

      {/* Controles de filtro */}
      <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex gap-2 p-1 bg-gray-900 rounded-lg border border-gray-800">
            <button
              onClick={() => setFiltroEstado('pendiente')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filtroEstado === 'pendiente' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Pendientes ({countPendientes})
            </button>
            <button
              onClick={() => setFiltroEstado('resuelta')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filtroEstado === 'resuelta' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Resueltas ({countResueltas})
            </button>
            <button
              onClick={() => setFiltroEstado('todas')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filtroEstado === 'todas' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Todas ({countTodas})
            </button>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Filtrar por tipo:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroTipo('todas')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${filtroTipo === 'todas' ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setFiltroTipo('criticas')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${filtroTipo === 'criticas' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'}`}
              >
                Críticas ({countCriticas})
              </button>
              <button
                onClick={() => setFiltroTipo('stock')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${filtroTipo === 'stock' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'}`}
              >
                Stock ({countStock})
              </button>
              <button
                onClick={() => setFiltroTipo('caducidad')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${filtroTipo === 'caducidad' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'}`}
              >
                Caducidad ({countCaducidad})
              </button>
            </div>
          </div>
        </div>
      </div>

      {filtroTipo === 'criticas' && countCriticas > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Alertas Críticas</h2>
            <p className="text-gray-400 text-sm">Requieren atención inmediata</p>
          </div>
        </div>
      )}

      {/* Lista de alertas */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Cargando alertas...</div>
        ) : alertasFiltradas.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-gray-800 rounded-xl border border-white/5">
            No hay alertas que coincidan con los filtros.
          </div>
        ) : (
          alertasFiltradas.map((alerta) => (
            <div 
              key={alerta.id} 
              className={`bg-gray-800 border-l-4 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-[#1a1a1a] ${
                alerta.gravedad === 'critica' ? 'border-l-red-500' : 
                alerta.gravedad === 'media' ? 'border-l-orange-500' : 'border-l-indigo-500'
              } border-y border-r border-y-white/5 border-r-white/5`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  alerta.tipo === 'caducidad' ? 'bg-purple-500/10 text-purple-400' : 
                  alerta.tipo === 'stock' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {alerta.tipo === 'caducidad' ? <Calendar className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold text-lg">{alerta.titulo}</h3>
                    {alerta.gravedad === 'critica' && (
                      <span className="bg-red-500/10 text-red-400 text-xs px-2 py-0.5 rounded border border-red-500/20">
                        Crítico
                      </span>
                    )}
                    <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded border border-gray-700">
                      {alerta.estado === 'pendiente' ? 'Pendiente' : 'Resuelta'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{alerta.mensaje}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(alerta.created_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    {alerta.estado === 'resuelta' && alerta.resuelta_en && (
                      <>
                        <span className="mx-1">•</span>
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        <span>Resuelta el {new Date(alerta.resuelta_en).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 md:ml-auto">
                {alerta.estado === 'pendiente' && (
                  <button 
                    onClick={() => handleResolver(alerta.id)}
                    className="flex items-center gap-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold border border-green-500/30 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Resolver
                  </button>
                )}
                {alerta.entidad_tipo === 'producto' && (
                  <Link 
                    to="/materiales" 
                    className="bg-gray-900 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-800 hover:border-gray-600 transition-colors"
                  >
                    Ver Producto
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
