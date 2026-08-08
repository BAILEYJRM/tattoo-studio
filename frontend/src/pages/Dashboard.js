import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getClientes, getEmpleados, getCitas, getResumenMesVentas, getResumenMesGastos, getStockBajo, getAusenciasRango } from '../api';

const ESTADO_CONFIG = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  confirmada: { label: 'Confirmada', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  completada: { label: 'Completada', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  cancelada: { label: 'Cancelada', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.pendiente;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({ clientes: 0, empleados: 0, hoy: 0, pendientes: 0 });
  const [citasHoy, setCitasHoy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [finanzas, setFinanzas] = useState({ ventas: 0, gastos: 0 });
  const [stockBajo, setStockBajo] = useState([]);
  const [clientesConflictivos, setClientesConflictivos] = useState([]);
  const [ausenciasSemana, setAusenciasSemana] = useState([]);

  useEffect(() => {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    const year = hoy.getFullYear();
    const month = hoy.getMonth() + 1;

    // Calcular inicio y fin de la semana actual (lunes-domingo)
    const diaSemana = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1;
    const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - diaSemana);
    const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6);
    const lunesStr = lunes.toISOString().split('T')[0];
    const domingoStr = domingo.toISOString().split('T')[0];

    Promise.all([
      getClientes(),
      getEmpleados(),
      getCitas({ fecha: hoyStr }),
      getCitas(),
      getResumenMesVentas(year, month).catch(() => ({ data: { total: 0 } })),
      getResumenMesGastos(year, month).catch(() => ({ data: { total: 0 } })),
      getStockBajo().catch(() => ({ data: [] })),
      getAusenciasRango({ fecha_inicio: lunesStr, fecha_fin: domingoStr }).catch(() => ({ data: [] })),
    ]).then(([clientes, empleados, citasDeHoy, todasCitas, ventas, gastos, bajo, ausencias]) => {
      const pendientes = todasCitas.data.filter((c) => c.estado === 'pendiente').length;
      setStats({
        clientes: clientes.data.length,
        empleados: empleados.data.length,
        hoy: citasDeHoy.data.length,
        pendientes,
      });
      setCitasHoy(citasDeHoy.data);
      setFinanzas({ ventas: Number(ventas.data.total || 0), gastos: Number(gastos.data.total || 0) });
      setStockBajo(bajo.data || []);
      setClientesConflictivos(clientes.data.filter((c) => Number(c.no_shows) >= 3));
      setAusenciasSemana(ausencias.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{saludo}, {usuario?.nombre}</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Alertas */}
      <div className="space-y-3">
        {!loading && stockBajo.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-red-400 text-sm font-medium">Stock bajo en {stockBajo.length} producto{stockBajo.length > 1 ? 's' : ''}</p>
              <p className="text-red-400/70 text-xs mt-0.5">{stockBajo.slice(0, 3).map((p) => p.nombre).join(', ')}{stockBajo.length > 3 ? '…' : ''}</p>
            </div>
          </div>
        )}
        {!loading && clientesConflictivos.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-orange-400 text-sm font-medium">{clientesConflictivos.length} cliente{clientesConflictivos.length > 1 ? 's' : ''} con 3+ no-shows</p>
              <p className="text-orange-400/70 text-xs mt-0.5">{clientesConflictivos.slice(0, 3).map((c) => `${c.nombre} ${c.apellidos} (${c.no_shows})`).join(', ')}</p>
            </div>
          </div>
        )}
        {!loading && ausenciasSemana.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-yellow-400 text-sm font-medium">Ausencias esta semana</p>
              <div className="mt-1 space-y-0.5">
                {ausenciasSemana.map((a) => (
                  <p key={a.id} className="text-yellow-400/70 text-xs">
                    {a.empleado_nombre} · {fmtDate(a.fecha_inicio?.split('T')[0])} — {fmtDate(a.fecha_fin?.split('T')[0])}
                    {a.motivo ? ` (${a.motivo})` : ''}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-900 rounded-xl p-5 h-24 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Clientes" value={stats.clientes} color="bg-indigo-600/20"
            icon={<svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <StatCard label="Empleados" value={stats.empleados} color="bg-purple-600/20"
            icon={<svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          />
          <StatCard label="Citas hoy" value={stats.hoy} color="bg-blue-600/20"
            icon={<svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <StatCard label="Pendientes" value={stats.pendientes} color="bg-yellow-600/20"
            icon={<svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>
      )}

      {/* Finanzas */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Ventas del mes</p>
            <p className="text-green-400 text-2xl font-bold mt-1">{finanzas.ventas.toFixed(2)} €</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Gastos del mes</p>
            <p className="text-red-400 text-2xl font-bold mt-1">{finanzas.gastos.toFixed(2)} €</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Beneficio del mes</p>
            <p className={`text-2xl font-bold mt-1 ${finanzas.ventas - finanzas.gastos >= 0 ? 'text-white' : 'text-red-400'}`}>
              {(finanzas.ventas - finanzas.gastos).toFixed(2)} €
            </p>
          </div>
        </div>
      )}

      {/* Citas de hoy */}
      <div className="bg-gray-900 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Citas de hoy</h2>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-800 rounded-lg animate-pulse" />)}</div>
        ) : citasHoy.length === 0 ? (
          <div className="text-center py-8"><p className="text-gray-500 text-sm">No hay citas programadas para hoy</p></div>
        ) : (
          <div className="space-y-2">
            {citasHoy.map((cita) => (
              <div key={cita.id} className="flex items-center gap-4 bg-gray-800 rounded-lg px-4 py-3">
                <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: cita.artista_color || '#6366f1' }} />
                <div className="text-center min-w-[50px]">
                  <p className="text-white font-medium text-sm">{cita.hora_inicio?.slice(0, 5)}</p>
                  <p className="text-gray-500 text-xs">{cita.hora_fin?.slice(0, 5)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-white text-sm font-medium truncate">{cita.cliente_nombre}</p>
                    {cita.cliente_conflictivo && <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">⚠</span>}
                  </div>
                  <p className="text-gray-400 text-xs truncate">{cita.artista_nombre}</p>
                </div>
                <EstadoBadge estado={cita.estado} />
                {cita.precio && <span className="text-gray-300 text-sm font-medium">{Number(cita.precio).toFixed(2)} €</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
