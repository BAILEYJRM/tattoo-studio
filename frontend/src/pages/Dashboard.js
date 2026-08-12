import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getClientes, getEmpleados, getCitas, getResumenMesVentas, getResumenMesGastos, getStockBajo, getAusenciasRango, getLeads, getProyectos, getPresupuestos } from '../api';
import { SlidingNumber } from '../components/animate-ui/sliding-number';
import { AnimatedIcon } from '../components/animate-ui/animated-icon';
import {
  Users, UserCheck, Calendar, Clock, UserPlus, FolderKanban, FileText, Target,
  TrendingUp, TrendingDown, Wallet, CalendarPlus, Package, Settings, AlertTriangle
} from 'lucide-react';

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

function StatCard({ label, value, isNumber = true, prefix = "", suffix = "", icon, color, subtext, subtextColor, hoverEffect = "bounce" }) {
  return (
    <motion.div initial="rest" whileHover="hover" className="bg-gray-900 border border-gray-800/50 rounded-xl p-5 flex justify-between items-start shadow-sm transition-all hover:border-indigo-500/40 group">
      <div className="flex flex-col gap-1">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
        <div className="text-white text-3xl font-black tracking-tight">
          {typeof value === 'number' && isNumber ? (
            <SlidingNumber value={value} prefix={prefix} suffix={suffix} />
          ) : (
            <span>{prefix}{value}{suffix}</span>
          )}
        </div>
        {subtext && <p className={`text-xs font-medium mt-1 ${subtextColor || 'text-gray-500'}`}>{subtext}</p>}
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color} shadow-sm group-hover:scale-105 transition-transform`}>
        <AnimatedIcon icon={icon} hoverEffect={hoverEffect} size={20} className="text-white" />
      </div>
    </motion.div>
  );
}

const MotionLink = motion(Link);

export default function Dashboard() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({ clientes: 0, empleados: 0, hoy: 0, pendientes: 0 });
  const [citasHoy, setCitasHoy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [finanzas, setFinanzas] = useState({ ventas: 0, gastos: 0 });
  const [stockBajo, setStockBajo] = useState([]);
  const [clientesConflictivos, setClientesConflictivos] = useState([]);
  const [ausenciasSemana, setAusenciasSemana] = useState([]);
  const [crmStats, setCrmStats] = useState({ leadsNuevos: 0, proyectosActivos: 0, presupuestosAceptados: 0, tasaConversion: 0 });

  useEffect(() => {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    const year = hoy.getFullYear();
    const month = hoy.getMonth() + 1;

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
      getLeads().catch(() => ({ data: [] })),
      getProyectos().catch(() => ({ data: [] })),
      getPresupuestos().catch(() => ({ data: [] })),
    ]).then(([clientes, empleados, citasDeHoy, todasCitas, ventas, gastos, bajo, ausencias, leads, proyectos, presupuestos]) => {
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

      const totalLeads = leads.data.length;
      const convertidos = leads.data.filter(l => l.estado === 'Convertido').length;
      const tasaConv = totalLeads > 0 ? Number(((convertidos / totalLeads) * 100).toFixed(0)) : 0;

      setCrmStats({
        leadsNuevos: leads.data.filter(l => l.estado === 'Nuevo' || l.estado === 'Contactado').length,
        proyectosActivos: proyectos.data.filter(p => p.estado === 'En curso' || p.estado === 'Aprobado' || p.estado === 'En diseño').length,
        presupuestosAceptados: presupuestos.data.filter(p => p.estado === 'Aceptado').length,
        tasaConversion: tasaConv
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{saludo}, {usuario?.nombre}</h1>
        <p className="text-gray-400 text-sm mt-0.5 capitalize">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-3">
        {!loading && stockBajo.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
            <AnimatedIcon icon={AlertTriangle} hoverEffect="shake" size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 text-sm font-medium">Stock bajo en {stockBajo.length} producto{stockBajo.length > 1 ? 's' : ''}</p>
              <p className="text-red-400/70 text-xs mt-0.5">{stockBajo.slice(0, 3).map((p) => p.nombre).join(', ')}{stockBajo.length > 3 ? '…' : ''}</p>
            </div>
          </div>
        )}
        {!loading && clientesConflictivos.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
            <AnimatedIcon icon={AlertTriangle} hoverEffect="shake" size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-orange-400 text-sm font-medium">{clientesConflictivos.length} cliente{clientesConflictivos.length > 1 ? 's' : ''} con 3+ no-shows</p>
              <p className="text-orange-400/70 text-xs mt-0.5">{clientesConflictivos.slice(0, 3).map((c) => `${c.nombre} ${c.apellidos} (${c.no_shows})`).join(', ')}</p>
            </div>
          </div>
        )}
        {!loading && ausenciasSemana.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
            <AnimatedIcon icon={Calendar} hoverEffect="bounce" size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
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

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-900 border border-gray-800/50 rounded-xl p-5 h-24 animate-pulse shadow-lg" />)}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Clientes" value={stats.clientes} color="bg-blue-600" icon={Users} hoverEffect="bounce" />
            <StatCard label="Empleados" value={stats.empleados} color="bg-purple-600" icon={UserCheck} hoverEffect="pulse" />
            <StatCard label="Citas hoy" value={stats.hoy} color="bg-green-600" icon={Calendar} hoverEffect="rotate" />
            <StatCard label="Pendientes" value={stats.pendientes} color="bg-orange-500" icon={Clock} hoverEffect="bounce"
              subtext={stats.pendientes > 0 ? `${stats.pendientes} alertas` : ''} subtextColor="text-orange-400"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Leads Activos" value={crmStats.leadsNuevos} color="bg-indigo-600" icon={UserPlus} hoverEffect="pulse"
              subtext="En seguimiento" subtextColor="text-indigo-400"
            />
            <StatCard label="Proyectos" value={crmStats.proyectosActivos} color="bg-cyan-600" icon={FolderKanban} hoverEffect="bounce"
              subtext="En diseño / curso" subtextColor="text-cyan-400"
            />
            <StatCard label="Presupuestos" value={crmStats.presupuestosAceptados} color="bg-emerald-600" icon={FileText} hoverEffect="rotate"
              subtext="Aceptados" subtextColor="text-emerald-400"
            />
            <StatCard label="Conversión CRM" value={crmStats.tasaConversion} suffix="%" color="bg-pink-600" icon={Target} hoverEffect="pulse"
              subtext="Leads a Clientes" subtextColor="text-pink-400"
            />
          </div>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial="rest" whileHover="hover" className="bg-gray-900 border border-gray-800/50 shadow-lg rounded-xl p-5 flex justify-between items-center group transition-all hover:border-green-500/40">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Ventas del mes</p>
              <div className="text-green-400 text-3xl font-black mt-2 tracking-tight">
                <SlidingNumber value={finanzas.ventas} suffix=" €" />
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
              <AnimatedIcon icon={TrendingUp} hoverEffect="bounce" size={22} />
            </div>
          </motion.div>

          <motion.div initial="rest" whileHover="hover" className="bg-gray-900 border border-gray-800/50 shadow-lg rounded-xl p-5 flex justify-between items-center group transition-all hover:border-red-500/40">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Gastos del mes</p>
              <div className="text-red-400 text-3xl font-black mt-2 tracking-tight">
                <SlidingNumber value={finanzas.gastos} suffix=" €" />
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <AnimatedIcon icon={TrendingDown} hoverEffect="shake" size={22} />
            </div>
          </motion.div>

          <motion.div initial="rest" whileHover="hover" className="bg-gray-900 border border-gray-800/50 shadow-lg rounded-xl p-5 flex justify-between items-center group transition-all hover:border-indigo-500/40">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Beneficio del mes</p>
              <div className={`text-3xl font-black mt-2 tracking-tight ${finanzas.ventas - finanzas.gastos >= 0 ? 'text-white' : 'text-red-400'}`}>
                <SlidingNumber value={finanzas.ventas - finanzas.gastos} suffix=" €" />
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <AnimatedIcon icon={Wallet} hoverEffect="rotate" size={22} />
            </div>
          </motion.div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800/50 shadow-lg rounded-xl p-6">
        <h2 className="text-white text-lg font-bold tracking-wide mb-6">Citas de hoy</h2>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-800 rounded-lg animate-pulse" />)}</div>
        ) : citasHoy.length === 0 ? (
          <div className="text-center py-8"><p className="text-gray-500 text-sm">No hay citas programadas para hoy</p></div>
        ) : (
          <div className="space-y-2">
            {citasHoy.map((cita) => (
              <div key={cita.id} className="flex items-center gap-4 bg-gray-800/50 rounded-lg px-4 py-3">
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
                  <p className="text-gray-400 text-xs truncate mt-0.5">
                    {cita.artista_nombre} {cita.cabina_nombre ? `· Cabina: ${cita.cabina_nombre}` : ''}
                  </p>
                </div>
                <EstadoBadge estado={cita.estado} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-white text-lg font-bold tracking-wide mb-4 mt-8">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Nueva Cita', desc: 'Programa en el calendario', link: '/citas', color: 'bg-blue-600', icon: CalendarPlus, effect: 'bounce' },
            { title: 'Añadir Cliente', desc: 'Registra un nuevo perfil', link: '/clientes', color: 'bg-green-600', icon: UserPlus, effect: 'pulse' },
            { title: 'Ver Inventario', desc: 'Consulta tus productos', link: '/materiales', color: 'bg-purple-600', icon: Package, effect: 'rotate' },
            { title: 'Configuración', desc: 'Ajusta tu estudio', link: '/configuracion', color: 'bg-orange-500', icon: Settings, effect: 'rotate' }
          ].map((action, i) => (
            <MotionLink
              key={i}
              to={action.link}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="bg-gray-900 border border-gray-800/50 rounded-xl p-5 shadow-lg flex flex-col justify-between group hover:border-indigo-500/40 transition-all cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${action.color} mb-4 shadow-sm`}>
                <AnimatedIcon icon={action.icon} hoverEffect={action.effect} size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">{action.title}</h3>
                <p className="text-gray-400 text-xs mb-4">{action.desc}</p>
                <span className="text-blue-500 font-bold text-sm group-hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                  Ir →
                </span>
              </div>
            </MotionLink>
          ))}
        </div>
      </div>
    </div>
  );
}
