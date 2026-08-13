import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getEstResumen, getEstEvolucion } from '../api';

function eur(v) { return `${Number(v || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`; }

function hoy() { return new Date().toISOString().split('T')[0]; }
function lunesSemanaActual() {
  const n = new Date();
  const day = n.getDay(), diff = n.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(n.setDate(diff)).toISOString().split('T')[0];
}
function primerDiaMes() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-01`;
}

function Card({ label, value, sub, color }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-800">
      <p className="text-gray-400 text-sm font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color || 'text-white'}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-2">{sub}</p>}
    </div>
  );
}

function BarHorizontal({ label, value, max, color = '#6366f1' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-sm w-28 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-gray-800 rounded-full h-2">
        <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(pct,100)}%`, backgroundColor: color }} />
      </div>
      <span className="text-white text-sm font-medium w-24 text-right flex-shrink-0">{eur(value)} ({pct}%)</span>
    </div>
  );
}

export default function Ingresos() {
  const [dataSemana, setDataSemana] = useState(null);
  const [dataMes, setDataMes] = useState(null);
  const [dataEvo, setDataEvo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anioEvo, setAnioEvo] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getEstResumen({ fecha_inicio: lunesSemanaActual(), fecha_fin: hoy() }),
      getEstResumen({ fecha_inicio: primerDiaMes(), fecha_fin: hoy() }),
      getEstEvolucion(anioEvo)
    ])
      .then(([semR, mesR, evoR]) => {
        setDataSemana(semR.data);
        setDataMes(mesR.data);
        setDataEvo(evoR.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [anioEvo]);

  if (loading || !dataSemana || !dataMes) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Ingresos</h1>
        <div className="text-gray-400">Cargando datos...</div>
      </div>
    );
  }

  // Máximos para las barras
  const totMes = dataMes.facturacion_total;
  const totServicios = dataMes.ingresos_servicios;

  const maxEvo = dataEvo ? Math.max(...dataEvo.meses.map((m) => m.ingresos), 1) : 1;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">{t('ingresos_titulo')}</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          label="Ingresos esta semana (Lun - Hoy)" 
          value={eur(dataSemana.facturacion_total)} 
          sub={`Servicios: ${eur(dataSemana.ingresos_servicios)} | Productos: ${eur(dataSemana.ingresos_productos)}`}
          color="text-indigo-400"
        />
        <Card 
          label="Ingresos este mes" 
          value={eur(dataMes.facturacion_total)} 
          sub={`Servicios: ${eur(dataMes.ingresos_servicios)} | Productos: ${eur(dataMes.ingresos_productos)}`}
          color="text-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orígenes de los ingresos (Mes Actual) */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h2 className="text-white font-semibold text-base mb-4">Orígenes de Ingresos (Mes en curso)</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Por Categoría</p>
              <div className="space-y-3">
                <BarHorizontal label="Servicios" value={dataMes.ingresos_servicios} max={totMes} color="#6366f1" />
                <BarHorizontal label="Venta Productos" value={dataMes.ingresos_productos} max={totMes} color="#10b981" />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Desglose de Servicios (Nº Citas)</p>
              <div className="flex gap-4 mb-2 text-xs">
                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"/> Tatuaje: {dataMes.distribucion_servicios.tatuaje}</span>
                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"/> Piercing: {dataMes.distribucion_servicios.piercing}</span>
                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500"/> Micro: {dataMes.distribucion_servicios.microblading}</span>
                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"/> Láser: {dataMes.distribucion_servicios.laser}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Evolución Mensual (Solo Ingresos) */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-base">Evolución de Ingresos</h2>
            <select value={anioEvo} onChange={(e) => setAnioEvo(Number(e.target.value))}
              className="bg-gray-800 text-white text-sm rounded-lg px-2 py-1 outline-none border border-gray-700">
              {[new Date().getFullYear(), new Date().getFullYear()-1, new Date().getFullYear()-2].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-5 mb-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />Servicios</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />Productos</span>
          </div>

          <div className="space-y-2 mt-4">
            {dataEvo?.meses.map((m) => {
              const pServ = maxEvo > 0 ? (m.ingresos_servicios / maxEvo) * 100 : 0;
              const pProd = maxEvo > 0 ? (m.ingresos_productos / maxEvo) * 100 : 0;
              
              return (
                <div key={m.mes} className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm w-10 text-right">{m.mes}</span>
                  <div className="flex-1 flex h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 transition-all" style={{ width: `${pServ}%` }} />
                    <div className="bg-emerald-500 transition-all" style={{ width: `${pProd}%` }} />
                  </div>
                  <span className="text-white text-xs w-20 text-right">{eur(m.ingresos)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
