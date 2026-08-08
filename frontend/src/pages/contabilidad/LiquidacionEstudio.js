import React, { useState, useCallback } from 'react';
import { getLiquidacionEstudio } from '../../api';

function Eur({ v, className }) {
  return <span className={className}>{Number(v || 0).toFixed(2)} €</span>;
}

function Card({ label, value, color, sub }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-white'}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function BarChart({ items, maxVal, colorKey, labelKey, valueKey }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const val = Number(item[valueKey] || 0);
        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-40 flex-shrink-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item[colorKey] || '#6366f1' }} />
              <span className="text-gray-300 text-sm truncate">{item[labelKey]}</span>
            </div>
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: item[colorKey] || '#6366f1' }} />
            </div>
            <span className="text-white text-sm font-medium w-24 text-right flex-shrink-0">
              <Eur v={val} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function LiquidacionEstudio() {
  const now = new Date();
  const mesInicio = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const mesFin = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

  const [fechaInicio, setFechaInicio] = useState(mesInicio);
  const [fechaFin, setFechaFin] = useState(mesFin);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const filtrar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLiquidacionEstudio(fechaInicio, fechaFin);
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [fechaInicio, fechaFin]);

  // Cargar al montar con valores por defecto
  React.useEffect(() => { filtrar(); }, []); // eslint-disable-line

  const maxArtista = data ? Math.max(...data.por_artista.map(a => Number(a.facturado || 0)), 1) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Liquidación del estudio</h1>
        <p className="text-gray-400 text-sm mt-0.5">Ingresos, gastos y beneficio neto del período</p>
      </div>

      {/* Filtros */}
      <div className="bg-gray-900 rounded-xl p-5 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Fecha inicio</label>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Fecha fin</label>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button onClick={filtrar} disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
          {loading ? 'Cargando...' : 'Filtrar'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-900 rounded-xl p-5 h-24 animate-pulse" />)}
        </div>
      ) : data && (
        <>
          {/* Cards principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card label="Ingresos servicios" value={<Eur v={data.resumen.total_servicios} />}
              sub={`${data.resumen.num_servicios} servicios`} color="text-white" />
            <Card label="Ingresos productos" value={<Eur v={data.resumen.total_productos} />}
              sub={`${data.resumen.num_ventas} ventas`} color="text-white" />
            <Card label="Total gastos" value={<Eur v={data.resumen.total_gastos} />}
              sub={`${data.resumen.num_gastos} gastos`} color="text-red-400" />
            <Card label="Beneficio neto" value={<Eur v={data.resumen.beneficio_neto} />}
              color={data.resumen.beneficio_neto >= 0 ? 'text-green-400' : 'text-red-400'} />
          </div>

          {/* Desglose ingresos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-1">Distribución de ingresos</h3>
              <p className="text-gray-500 text-xs mb-4">Total: <Eur v={data.resumen.total_ingresos} /></p>
              {/* Barra ingresos vs gastos */}
              {(() => {
                const ing = Number(data.resumen.total_ingresos);
                const gas = Number(data.resumen.total_gastos);
                const max = Math.max(ing, gas, 1);
                return (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Ingresos totales</span>
                        <span className="text-green-400 font-medium"><Eur v={ing} /></span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: `${(ing/max)*100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Gastos</span>
                        <span className="text-red-400 font-medium"><Eur v={gas} /></span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-3">
                        <div className="bg-red-500 h-3 rounded-full" style={{ width: `${(gas/max)*100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Comisiones artistas</span>
                        <span className="text-yellow-400 font-medium"><Eur v={data.resumen.total_comisiones} /></span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-3">
                        <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${(Number(data.resumen.total_comisiones)/max)*100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Beneficio estudio (servicios)</span>
                        <span className="text-indigo-400 font-medium"><Eur v={data.resumen.beneficio_servicios} /></span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-3">
                        <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${(Number(data.resumen.beneficio_servicios)/max)*100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Por artista */}
            <div className="bg-gray-900 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Facturado por artista</h3>
              {data.por_artista.length === 0 ? (
                <p className="text-gray-500 text-sm">Sin datos</p>
              ) : (
                <BarChart items={data.por_artista} maxVal={maxArtista}
                  colorKey="color_calendario" labelKey="artista_nombre" valueKey="facturado" />
              )}
            </div>
          </div>

          {/* Tabla por artista */}
          {data.por_artista.length > 0 && (
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800">
                <h2 className="text-white font-semibold">Desglose por artista</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Artista','Trabajos','Facturado','Comisión','B. Estudio'].map((h) => (
                        <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.por_artista.map((a, i) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color_calendario || '#6366f1' }} />
                            <span className="text-white">{a.artista_nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-gray-300">{a.trabajos}</td>
                        <td className="px-4 py-2.5 text-white font-medium"><Eur v={a.facturado} /></td>
                        <td className="px-4 py-2.5 text-yellow-400"><Eur v={a.comision} /></td>
                        <td className="px-4 py-2.5 text-green-400 font-medium"><Eur v={a.beneficio_estudio} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Artículos vendidos */}
          {data.articulos.length > 0 && (
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800">
                <h2 className="text-white font-semibold">Top artículos vendidos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Artículo','Cantidad','Total'].map((h) => (
                        <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.articulos.map((a, i) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-2.5 text-white">{a.descripcion}</td>
                        <td className="px-4 py-2.5 text-gray-300">{a.cantidad}</td>
                        <td className="px-4 py-2.5 text-white font-medium"><Eur v={a.total} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
