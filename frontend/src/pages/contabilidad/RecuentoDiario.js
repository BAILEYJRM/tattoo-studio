import React, { useState, useEffect, useCallback } from 'react';
import { getRecuentoDiario } from '../../api';

function Eur({ v, className }) {
  return <span className={className}>{Number(v || 0).toFixed(2)} €</span>;
}

function Card({ label, value, sub, color }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-white'}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function RecuentoDiario() {
  const hoy = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(hoy);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async (f) => {
    setLoading(true);
    try {
      const res = await getRecuentoDiario(f);
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(fecha); }, [cargar, fecha]);

  const fmtHora = (t) => t?.slice(0, 5) || '';
  const fmtFp = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', bizum: 'Bizum', transferencia: 'Trans.' };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Recuento diario</h1>
          <p className="text-gray-400 text-sm mt-0.5">Resumen de caja del día</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
            className="bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={handlePrint}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Imprimir
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-900 rounded-xl p-5 h-24 animate-pulse" />)}
        </div>
      ) : !data ? null : (
        <>
          {/* Resumen general */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card label="Total servicios" value={<Eur v={data.resumen.total_servicios} />} color="text-white" />
            <Card label="Total productos" value={<Eur v={data.resumen.total_productos} />} color="text-white" />
            <Card label="Señales cobradas" value={<Eur v={data.resumen.total_senales} />} color="text-blue-400" />
            <Card label="Ganancias estudio" value={<Eur v={data.resumen.ganancias_estudio} />} color="text-green-400" />
          </div>

          {/* Formas de pago */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {['efectivo','tarjeta','bizum','transferencia'].map((fp) => (
              <div key={fp} className="bg-gray-900 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-400 text-xs font-bold uppercase">{fp.slice(0,2).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs capitalize">{fp}</p>
                  <p className="text-white font-semibold"><Eur v={data.resumen[fp]} /></p>
                </div>
              </div>
            ))}
          </div>

          {/* Citas */}
          {data.citas.length > 0 && (
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800">
                <h2 className="text-white font-semibold">Citas ({data.citas.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Hora','Cliente','Artista','Precio','Señal','F.Pago','Comisión','B.Estudio'].map((h) => (
                        <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.citas.map((c) => (
                      <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-2.5 text-gray-300 whitespace-nowrap">{fmtHora(c.hora_inicio)}–{fmtHora(c.hora_fin)}</td>
                        <td className="px-4 py-2.5 text-white">{c.cliente_nombre}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.artista_color || '#6366f1' }} />
                            <span className="text-gray-300">{c.artista_nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-white font-medium"><Eur v={c.precio} /></td>
                        <td className="px-4 py-2.5">
                          {Number(c.importe_senal) > 0 ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${c.senal_cobrada ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>
                              <Eur v={c.importe_senal} />
                            </span>
                          ) : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-gray-400 capitalize">{fmtFp[c.forma_pago] || c.forma_pago || '—'}</td>
                        <td className="px-4 py-2.5 text-yellow-400"><Eur v={c.comision_importe} /> <span className="text-gray-600 text-xs">({c.comision_porcentaje}%)</span></td>
                        <td className="px-4 py-2.5 text-green-400 font-medium"><Eur v={c.beneficio_estudio} /></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-700 bg-gray-800/50">
                      <td colSpan={3} className="px-4 py-2.5 text-gray-400 text-xs font-medium">TOTALES</td>
                      <td className="px-4 py-2.5 text-white font-bold"><Eur v={data.resumen.total_servicios} /></td>
                      <td colSpan={2} />
                      <td className="px-4 py-2.5 text-yellow-400 font-bold"><Eur v={data.resumen.ganancias_artistas} /></td>
                      <td className="px-4 py-2.5 text-green-400 font-bold"><Eur v={data.resumen.ganancias_estudio} /></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Ventas */}
          {data.ventas.length > 0 && (
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800">
                <h2 className="text-white font-semibold">Ventas de productos ({data.ventas.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Cliente','Notas','Total','Forma pago'].map((h) => (
                        <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.ventas.map((v) => (
                      <tr key={v.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-2.5 text-white">{v.cliente_nombre || '—'}</td>
                        <td className="px-4 py-2.5 text-gray-400">{v.notas || '—'}</td>
                        <td className="px-4 py-2.5 text-white font-medium"><Eur v={v.total} /></td>
                        <td className="px-4 py-2.5 text-gray-400 capitalize">{fmtFp[v.forma_pago] || v.forma_pago || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-700 bg-gray-800/50">
                      <td colSpan={2} className="px-4 py-2.5 text-gray-400 text-xs font-medium">TOTAL PRODUCTOS</td>
                      <td className="px-4 py-2.5 text-white font-bold"><Eur v={data.resumen.total_productos} /></td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Resumen por artista */}
          {data.por_artista.length > 0 && (
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800">
                <h2 className="text-white font-semibold">Resumen por artista</h2>
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
                    {data.por_artista.map((a) => (
                      <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color_calendario || '#6366f1' }} />
                            <span className="text-white">{a.artista_nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-gray-300">{a.trabajos}</td>
                        <td className="px-4 py-2.5 text-white font-medium"><Eur v={a.total_facturado} /></td>
                        <td className="px-4 py-2.5 text-yellow-400"><Eur v={a.comision} /></td>
                        <td className="px-4 py-2.5 text-green-400 font-medium"><Eur v={a.beneficio_estudio} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.citas.length === 0 && data.ventas.length === 0 && (
            <div className="bg-gray-900 rounded-xl p-12 text-center">
              <p className="text-gray-500 text-sm">No hay actividad registrada para esta fecha</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
