import React, { useState, useEffect } from 'react';
import { getEmpleados, getLiquidacionArtista } from '../../api';

function Eur({ v, className }) {
  return <span className={className}>{Number(v || 0).toFixed(2)} €</span>;
}

function Card({ label, value, color }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-white'}`}>{value}</p>
    </div>
  );
}

export default function LiquidacionArtista() {
  const now = new Date();
  const mesInicio = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const mesFin = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

  const [empleados, setEmpleados] = useState([]);
  const [artistaId, setArtistaId] = useState('');
  const [fechaInicio, setFechaInicio] = useState(mesInicio);
  const [fechaFin, setFechaFin] = useState(mesFin);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getEmpleados().then(r => setEmpleados(r.data)).catch(console.error);
  }, []);

  const filtrar = async () => {
    if (!artistaId) return;
    setLoading(true);
    try {
      const res = await getLiquidacionArtista(artistaId, fechaInicio, fechaFin);
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';
  const fmtFp = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', bizum: 'Bizum', transferencia: 'Trans.' };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Liquidación de artista</h1>
          <p className="text-gray-400 text-sm mt-0.5">Desglose de trabajos y comisiones por artista</p>
        </div>
        {data && (
          <button onClick={handlePrint}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Imprimir
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-gray-900 rounded-xl p-5 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-400 mb-1.5">Artista</label>
          <select value={artistaId} onChange={(e) => setArtistaId(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Seleccionar artista</option>
            {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre} {e.apellidos}</option>)}
          </select>
        </div>
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
        <button onClick={filtrar} disabled={!artistaId || loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
          {loading ? 'Cargando...' : 'Filtrar'}
        </button>
      </div>

      {data && (
        <>
          {/* Artista info */}
          {data.artista && (
            <div className="flex items-center gap-3 bg-gray-900 rounded-xl px-5 py-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: data.artista.color_calendario || '#6366f1' }}>
                {data.artista.nombre?.charAt(0)}
              </div>
              <div>
                <p className="text-white font-semibold">{data.artista.nombre} {data.artista.apellidos}</p>
                {data.artista.nombre_artistico && <p className="text-gray-400 text-sm">{data.artista.nombre_artistico}</p>}
                <p className="text-gray-500 text-xs">Comisión base: {data.artista.comision_porcentaje || 0}%</p>
              </div>
            </div>
          )}

          {/* Totales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card label="Trabajos realizados" value={data.totales.total_trabajos} />
            <Card label="Total facturado" value={<Eur v={data.totales.total_facturado} />} color="text-white" />
            <Card label="Comisión artista" value={<Eur v={data.totales.total_comision_artista} />} color="text-yellow-400" />
            <Card label="Beneficio estudio" value={<Eur v={data.totales.total_beneficio_estudio} />} color="text-green-400" />
          </div>

          {/* Tabla trabajos */}
          {data.citas.length > 0 ? (
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800">
                <h2 className="text-white font-semibold">Detalle de trabajos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Fecha','Cliente','Descripción','Precio','Señal','F.Pago','% Comis.','Comisión','B. Estudio'].map((h) => (
                        <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.citas.map((c) => (
                      <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{fmtDate(c.fecha?.split('T')[0])}</td>
                        <td className="px-4 py-2.5 text-white">{c.cliente_nombre}</td>
                        <td className="px-4 py-2.5 text-gray-400 max-w-[150px] truncate">{c.descripcion || '—'}</td>
                        <td className="px-4 py-2.5 text-white font-medium"><Eur v={c.precio} /></td>
                        <td className="px-4 py-2.5 text-blue-400">
                          {Number(c.importe_senal) > 0 ? <Eur v={c.importe_senal} /> : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-gray-400">{fmtFp[c.forma_pago] || c.forma_pago || '—'}</td>
                        <td className="px-4 py-2.5 text-gray-400">{c.comision_porcentaje}%</td>
                        <td className="px-4 py-2.5 text-yellow-400"><Eur v={c.comision_importe} /></td>
                        <td className="px-4 py-2.5 text-green-400 font-medium"><Eur v={c.beneficio_estudio} /></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-700 bg-gray-800/50 font-bold">
                      <td colSpan={3} className="px-4 py-2.5 text-gray-400 text-xs">TOTALES</td>
                      <td className="px-4 py-2.5 text-white"><Eur v={data.totales.total_facturado} /></td>
                      <td className="px-4 py-2.5 text-blue-400"><Eur v={data.totales.total_senales} /></td>
                      <td colSpan={2} />
                      <td className="px-4 py-2.5 text-yellow-400"><Eur v={data.totales.total_comision_artista} /></td>
                      <td className="px-4 py-2.5 text-green-400"><Eur v={data.totales.total_beneficio_estudio} /></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl p-12 text-center">
              <p className="text-gray-500 text-sm">No hay trabajos en este período</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
