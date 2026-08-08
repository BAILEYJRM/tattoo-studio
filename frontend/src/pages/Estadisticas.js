import React, { useState, useEffect, useCallback } from 'react';
import {
  getEstResumen, getEstArtistas, getEstTopClientes,
  getEstEvolucion, getEstEdades, getEstMetodosPago, getEstEco,
} from '../api';

// ── Helpers ───────────────────────────────────────────────────────────────────
function eur(v) { return `${Number(v || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`; }
function num(v) { return Number(v || 0).toLocaleString('es-ES'); }

function hoy() { return new Date().toISOString().split('T')[0]; }
function primerDiaMes() {
  const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-01`;
}
function primerDiaMesAnterior() {
  const n = new Date(); n.setDate(1); n.setMonth(n.getMonth()-1);
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-01`;
}
function ultimoDiaMesAnterior() {
  const n = new Date(); n.setDate(0);
  return n.toISOString().split('T')[0];
}
function primerDiaAnio() { return `${new Date().getFullYear()}-01-01`; }
function hace3Meses() {
  const n = new Date(); n.setMonth(n.getMonth()-3);
  return n.toISOString().split('T')[0];
}

// ── Mini componentes ──────────────────────────────────────────────────────────
function Card({ label, value, sub, color, icon }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color || 'text-white'}`}>{value}</p>
          {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
        </div>
        {icon && <div className="text-gray-600 opacity-60">{icon}</div>}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-white font-semibold text-base mb-4">{children}</h2>;
}

function BarHorizontal({ label, value, max, color = '#6366f1', pct, right }) {
  const w = max > 0 ? Math.round((value / max) * 100) : (pct || 0);
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-sm w-28 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-gray-700 rounded-full h-2.5">
        <div className="h-2.5 rounded-full transition-all" style={{ width: `${Math.min(w,100)}%`, backgroundColor: color }} />
      </div>
      <span className="text-white text-sm font-medium w-28 text-right flex-shrink-0">{right}</span>
    </div>
  );
}

// ── Sección Evolución mensual ─────────────────────────────────────────────────
function SeccionEvolucion({ año }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anio, setAnio] = useState(año || new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    getEstEvolucion(anio)
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [anio]);

  const maxVal = data ? Math.max(...data.meses.map((m) => Math.max(m.ingresos, m.gastos, 1)), 1) : 1;

  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>Evolución mensual</SectionTitle>
        <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}
          className="bg-gray-700 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500">
          {[new Date().getFullYear(), new Date().getFullYear()-1, new Date().getFullYear()-2].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Leyenda */}
      <div className="flex gap-5 mb-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />Ingresos</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />Gastos</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />Beneficio</span>
      </div>

      {loading ? (
        <div className="h-48 animate-pulse bg-gray-800 rounded-lg" />
      ) : !data ? null : (
        <div className="space-y-3">
          {data.meses.map((m) => (
            <div key={m.mes_num} className="group">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span className="w-7 flex-shrink-0">{m.mes}</span>
                <span className="text-gray-600">{m.citas} citas</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 flex-shrink-0" />
                  <div className="flex-1 bg-gray-700 rounded h-2">
                    <div className="bg-green-500 h-2 rounded transition-all" style={{ width: `${(m.ingresos/maxVal)*100}%` }} />
                  </div>
                  <span className="text-green-400 text-xs w-24 text-right flex-shrink-0">{eur(m.ingresos)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 flex-shrink-0" />
                  <div className="flex-1 bg-gray-700 rounded h-2">
                    <div className="bg-red-500 h-2 rounded transition-all" style={{ width: `${(m.gastos/maxVal)*100}%` }} />
                  </div>
                  <span className="text-red-400 text-xs w-24 text-right flex-shrink-0">{eur(m.gastos)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 flex-shrink-0" />
                  <div className="flex-1 bg-gray-700 rounded h-2">
                    <div className={`h-2 rounded transition-all ${m.beneficio >= 0 ? 'bg-blue-500' : 'bg-orange-500'}`}
                      style={{ width: `${Math.abs(m.beneficio/maxVal)*100}%` }} />
                  </div>
                  <span className={`text-xs w-24 text-right flex-shrink-0 ${m.beneficio >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>{eur(m.beneficio)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
const RANGOS = [
  { label: 'Este mes',       get: () => ({ inicio: primerDiaMes(),       fin: hoy() }) },
  { label: 'Mes anterior',   get: () => ({ inicio: primerDiaMesAnterior(), fin: ultimoDiaMesAnterior() }) },
  { label: 'Últimos 3 meses',get: () => ({ inicio: hace3Meses(),         fin: hoy() }) },
  { label: 'Este año',       get: () => ({ inicio: primerDiaAnio(),      fin: hoy() }) },
];

const SERVICIO_CONFIG = {
  tatuaje:     { label: 'Tatuaje',     color: '#6366f1', icon: '🎨' },
  piercing:    { label: 'Piercing',    color: '#f59e0b', icon: '💎' },
  microblading:{ label: 'Microblading',color: '#ec4899', icon: '✏️' },
  laser:       { label: 'Láser',       color: '#14b8a6', icon: '⚡' },
};

const PAGO_COLORS = {
  efectivo: '#22c55e', tarjeta: '#6366f1', bizum: '#f59e0b', transferencia: '#14b8a6',
};

export default function Estadisticas() {
  const n = new Date();
  const [fechaInicio, setFechaInicio] = useState(primerDiaMes());
  const [fechaFin, setFechaFin] = useState(hoy());
  const [rangoActivo, setRangoActivo] = useState(0);

  const [resumen, setResumen]     = useState(null);
  const [artistas, setArtistas]   = useState([]);
  const [topClientes, setTopClientes] = useState(null);
  const [edades, setEdades]       = useState(null);
  const [metodos, setMetodos]     = useState(null);
  const [eco, setEco]             = useState(null);
  const [loading, setLoading]     = useState(true);
  const [sortArtistas, setSortArtistas] = useState('facturado');

  const cargar = useCallback(async () => {
    setLoading(true);
    const params = { fecha_inicio: fechaInicio, fecha_fin: fechaFin };
    try {
      const [rRes, aRes, tcRes, edRes, mpRes, ecoRes] = await Promise.all([
        getEstResumen(params),
        getEstArtistas(params),
        getEstTopClientes({ ...params, limite: 5 }),
        getEstEdades(),
        getEstMetodosPago(params),
        getEstEco(),
      ]);
      setResumen(rRes.data);
      setArtistas(aRes.data);
      setTopClientes(tcRes.data);
      setEdades(edRes.data);
      setMetodos(mpRes.data);
      setEco(ecoRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [fechaInicio, fechaFin]);

  useEffect(() => { cargar(); }, [cargar]);

  const aplicarRango = (idx) => {
    setRangoActivo(idx);
    const { inicio, fin } = RANGOS[idx].get();
    setFechaInicio(inicio);
    setFechaFin(fin);
  };

  const artistasOrdenados = [...artistas].sort((a, b) => b[sortArtistas] - a[sortArtistas]);

  const maxServicio = resumen
    ? Math.max(...Object.values(resumen.distribucion_servicios), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Estadísticas</h1>
        <p className="text-gray-400 text-sm mt-0.5">Análisis completo del estudio</p>
      </div>

      {/* Filtros */}
      <div className="bg-gray-900 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {RANGOS.map((r, i) => (
            <button key={r.label} onClick={() => aplicarRango(i)}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${rangoActivo === i ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Fecha inicio</label>
            <input type="date" value={fechaInicio} onChange={(e) => { setFechaInicio(e.target.value); setRangoActivo(-1); }}
              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Fecha fin</label>
            <input type="date" value={fechaFin} onChange={(e) => { setFechaFin(e.target.value); setRangoActivo(-1); }}
              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button onClick={cargar} disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
            {loading ? 'Cargando...' : 'Aplicar'}
          </button>
        </div>
      </div>

      {loading && !resumen ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-gray-900 rounded-xl p-5 h-24 animate-pulse" />)}
        </div>
      ) : resumen && (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card label="Citas totales" value={num(resumen.citas_totales)}
              sub={`${resumen.media_diaria}/día de media`}
              icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
            <Card label="Clientes" value={num(resumen.clientes_periodo)}
              sub={`${num(resumen.clientes_nuevos)} nuevos`}
              icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
            <Card label="Facturación" value={eur(resumen.facturacion_total)} color="text-white"
              sub={`Servicios + productos`}
              icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <Card label="Beneficio neto" value={eur(resumen.beneficio_total)}
              color={resumen.beneficio_total >= 0 ? 'text-green-400' : 'text-red-400'}
              sub={`Gastos: ${eur(resumen.total_gastos)}`}
            />
            <Card label="Consentimientos" value={num(resumen.consentimientos_generados)}
              sub="documentos digitales"
              icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            />
          </div>

          {/* Distribución de servicios */}
          <div className="bg-gray-900 rounded-xl p-5">
            <SectionTitle>Distribución de servicios</SectionTitle>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(SERVICIO_CONFIG).map(([key, cfg]) => {
                const count = resumen.distribucion_servicios[key] || 0;
                const pct = resumen.citas_totales > 0 ? Math.round((count / resumen.citas_totales) * 100) : 0;
                return (
                  <div key={key} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{cfg.icon}</span>
                      <span className="text-gray-400 text-sm">{cfg.label}</span>
                    </div>
                    <p className="text-white text-2xl font-bold">{count}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{pct}% del total</p>
                    <div className="mt-3 bg-gray-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Evolución mensual */}
          <SeccionEvolucion />

          {/* Rendimiento artistas */}
          {artistas.length > 0 && (
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <SectionTitle>Rendimiento por artista</SectionTitle>
                <select value={sortArtistas} onChange={(e) => setSortArtistas(e.target.value)}
                  className="bg-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1.5 outline-none">
                  <option value="facturado">Por facturado</option>
                  <option value="trabajos">Por trabajos</option>
                  <option value="media_por_trabajo">Por media/trabajo</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Artista','Trabajos','Facturado','Comisión','B. Estudio','Media/trabajo','Clientes únicos'].map((h) => (
                        <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {artistasOrdenados.map((a) => (
                      <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: a.color_calendario || '#6366f1' }} />
                            <span className="text-white">{a.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-gray-300">{a.trabajos}</td>
                        <td className="px-4 py-2.5 text-white font-medium">{eur(a.facturado)}</td>
                        <td className="px-4 py-2.5 text-yellow-400">{eur(a.comision)}</td>
                        <td className="px-4 py-2.5 text-green-400 font-medium">{eur(a.beneficio_estudio)}</td>
                        <td className="px-4 py-2.5 text-gray-300">{eur(a.media_por_trabajo)}</td>
                        <td className="px-4 py-2.5 text-gray-400">{a.clientes_unicos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top clientes */}
          {topClientes && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { titulo: 'Top clientes por visitas', data: topClientes.por_citas, valueKey: 'total_citas', valueLabel: (v) => `${v} citas`, color: 'text-indigo-400' },
                { titulo: 'Top clientes por gasto',   data: topClientes.por_gasto,  valueKey: 'total_gastado', valueLabel: (v) => eur(v), color: 'text-green-400' },
              ].map(({ titulo, data, valueKey, valueLabel, color }) => (
                <div key={titulo} className="bg-gray-900 rounded-xl p-5">
                  <SectionTitle>{titulo}</SectionTitle>
                  <div className="space-y-3">
                    {data.length === 0 ? (
                      <p className="text-gray-500 text-sm">Sin datos</p>
                    ) : data.map((c, i) => {
                      const max = data[0][valueKey];
                      const pct = max > 0 ? (c[valueKey] / max) * 100 : 0;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-gray-600 text-xs font-bold w-5 flex-shrink-0">#{i+1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-gray-300 text-sm truncate">{c.cliente_nombre}</span>
                              <span className={`text-sm font-medium flex-shrink-0 ml-2 ${color}`}>{valueLabel(c[valueKey])}</span>
                            </div>
                            <div className="bg-gray-700 rounded-full h-1">
                              <div className="h-1 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Métodos de pago */}
          {metodos && (
            <div className="bg-gray-900 rounded-xl p-5">
              <SectionTitle>Métodos de pago</SectionTitle>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {metodos.metodos.map((m) => (
                  <div key={m.metodo} className="bg-gray-800 rounded-xl p-4">
                    <p className="text-gray-400 text-sm capitalize mb-1">{m.metodo}</p>
                    <p className="text-white text-xl font-bold">{eur(m.total)}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{m.porcentaje}% del total</p>
                    <div className="mt-3 bg-gray-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${m.porcentaje}%`, backgroundColor: PAGO_COLORS[m.metodo] || '#6366f1' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Distribución de edades */}
          {edades && edades.total > 0 && (
            <div className="bg-gray-900 rounded-xl p-5">
              <SectionTitle>Distribución de edades</SectionTitle>
              <p className="text-gray-500 text-xs mb-4">{num(edades.total)} clientes con fecha de nacimiento registrada</p>
              <div className="space-y-3">
                {edades.rangos.map((r) => (
                  <BarHorizontal
                    key={r.label}
                    label={r.label}
                    value={r.count}
                    max={edades.total}
                    color="#6366f1"
                    right={`${r.count} (${r.porcentaje}%)`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Impacto ecológico */}
          {eco && (
            <div className="bg-gray-900 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <SectionTitle>Impacto ecológico</SectionTitle>
                <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full mb-4">🌱 Gracias por digitalizar</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Consentimientos digitales', value: num(eco.consentimientos_digitales), icon: '📄', sub: 'documentos firmados' },
                  { label: 'Páginas ahorradas',         value: num(eco.paginas_ahorradas),         icon: '📃', sub: '3 pág./consentimiento' },
                  { label: 'Agua ahorrada',             value: `${num(eco.agua_ahorrada_litros)} L`, icon: '💧', sub: '10 L por página' },
                  { label: 'CO₂ evitado',               value: `${eco.co2_evitado_kg} kg`,          icon: '🌿', sub: '5g por página' },
                ].map(({ label, value, icon, sub }) => (
                  <div key={label} className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                    <div className="text-2xl mb-2">{icon}</div>
                    <p className="text-green-400 text-xl font-bold">{value}</p>
                    <p className="text-gray-300 text-sm mt-0.5">{label}</p>
                    <p className="text-gray-600 text-xs mt-1">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
