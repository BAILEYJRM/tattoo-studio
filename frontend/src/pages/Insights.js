import React, { useEffect, useState, useCallback } from 'react';
import { getInsightsResumen } from '../api';

function StatBox({ label, value, subtext, color = 'bg-indigo-600' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-white text-3xl font-bold mt-1">{value}</p>
      {subtext && <p className="text-indigo-400 text-xs mt-1 font-medium">{subtext}</p>}
    </div>
  );
}

export default function Insights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInsightsResumen();
      setData(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { funnel = [], origenes = [], proyectos = [], motivosPerdida = [], presupuestos = [] } = data || {};

  // Cálculos de agregados
  const totalLeads = funnel.reduce((acc, f) => acc + parseInt(f.cantidad, 10), 0);
  const convertidos = parseInt((funnel.find(f => f.estado === 'Convertido') || {}).cantidad || 0, 10);
  const tasaConversion = totalLeads > 0 ? ((convertidos / totalLeads) * 100).toFixed(1) : 0;

  const totalPotencialProyectos = proyectos.reduce((acc, p) => acc + parseFloat(p.total_estimado || 0), 0);
  const totalPresupuestosAceptados = presupuestos.filter(p => p.estado === 'Aceptado').reduce((acc, p) => acc + parseFloat(p.monto || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Inteligencia y Analytics Comercial</h1>
        <p className="text-gray-400 text-sm mt-0.5">Análisis del embudo de ventas, canales de captación y valor del pipeline</p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Total Leads Captados" value={totalLeads} subtext={`${convertidos} convertidos`} />
        <StatBox label="Tasa de Conversión Global" value={`${tasaConversion}%`} subtext="Lead -> Cliente" />
        <StatBox label="Valor Total Pipeline" value={`${totalPotencialProyectos.toLocaleString('es-ES')} €`} subtext="En proyectos estimados" />
        <StatBox label="Ventas Presupuestadas" value={`${totalPresupuestosAceptados.toLocaleString('es-ES')} €`} subtext="Presupuestos aceptados" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Embudo de Ventas (Funnel) */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Embudo de Conversión (Funnel)
          </h2>

          <div className="space-y-3 pt-2">
            {funnel.length === 0 ? (
              <p className="text-gray-500 text-xs italic">Sin datos de leads aún</p>
            ) : (
              funnel.map((item) => {
                const pct = totalLeads > 0 ? ((parseInt(item.cantidad, 10) / totalLeads) * 100).toFixed(0) : 0;
                return (
                  <div key={item.estado} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-300 font-medium">
                      <span>{item.estado}</span>
                      <span>{item.cantidad} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Canales de Captación / Origen */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Canales de Captación de Leads
          </h2>

          <div className="space-y-3 pt-2">
            {origenes.length === 0 ? (
              <p className="text-gray-500 text-xs italic">Sin origen registrado</p>
            ) : (
              origenes.map((item) => {
                const pct = totalLeads > 0 ? ((parseInt(item.cantidad, 10) / totalLeads) * 100).toFixed(0) : 0;
                return (
                  <div key={item.origen} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-300 font-medium">
                      <span>{item.origen}</span>
                      <span className="text-purple-400 font-bold">{item.cantidad} leads ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Estado de Proyectos */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Estado de Proyectos Comerciales
          </h2>

          <div className="divide-y divide-gray-800/80 text-xs">
            {proyectos.length === 0 ? (
              <p className="text-gray-500 italic py-2">Sin proyectos registrados</p>
            ) : (
              proyectos.map((p) => (
                <div key={p.estado} className="py-2.5 flex items-center justify-between">
                  <span className="text-gray-300 font-medium">{p.estado}</span>
                  <div className="text-right">
                    <span className="text-white font-bold block">{p.cantidad} proyecto(s)</span>
                    <span className="text-gray-500">{parseFloat(p.total_estimado || 0).toLocaleString('es-ES')} € est.</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Motivos de Pérdida Recurrentes */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Motivos de Pérdida Recurrentes
          </h2>

          <div className="divide-y divide-gray-800/80 text-xs">
            {motivosPerdida.length === 0 ? (
              <p className="text-gray-500 italic py-2">No hay registros de pérdida aún</p>
            ) : (
              motivosPerdida.map((m, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between">
                  <span className="text-gray-300 font-medium">{m.motivo || 'Sin especificar'}</span>
                  <span className="text-red-400 font-bold px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                    {m.cantidad} caso(s)
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
