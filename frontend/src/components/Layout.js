import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AnimatedIcon } from './animate-ui/animated-icon';
import {
  LayoutDashboard, Bell, Calendar, Users, ShoppingBag, FileText, Store, UserCheck, Mail,
  UserPlus, FolderKanban, Calculator, Clock, GitMerge, TrendingUp, Droplets, Syringe, Sparkles,
  Package, BarChart2, Receipt, DollarSign, Wallet, Building2, FileCheck, Settings, ShieldAlert, LogOut, Sun, Moon
} from 'lucide-react';

const MotionNavLink = motion(NavLink);

// Componentes Vectoriales SVG de Banderas para máxima compatibilidad multiplataforma (Windows/Mac/Linux/iOS/Android)
function FlagES({ className = "w-5 h-3.5" }) {
  return (
    <svg className={`rounded-[2px] overflow-hidden flex-shrink-0 border border-black/20 ${className}`} viewBox="0 0 750 500">
      <rect width="750" height="500" fill="#c60b1e" />
      <rect y="125" width="750" height="250" fill="#ffc400" />
    </svg>
  );
}

function FlagUS({ className = "w-5 h-3.5" }) {
  return (
    <svg className={`rounded-[2px] overflow-hidden flex-shrink-0 border border-black/20 ${className}`} viewBox="0 0 741 390">
      <rect width="741" height="390" fill="#b22234" />
      <path d="M0,60H741M0,120H741M0,180H741M0,240H741M0,300H741M0,360H741" stroke="#fff" strokeWidth="30" />
      <rect width="296.4" height="210" fill="#3c3b6e" />
      <g fill="#fff">
        <polygon points="14.8,20 18,29.9 28.5,29.9 20,36.1 23.2,46 14.8,39.8 6.4,46 9.6,36.1 1.1,29.9 11.6,29.9" />
        <polygon points="74.1,20 77.3,29.9 87.8,29.9 79.3,36.1 82.5,46 74.1,39.8 65.7,46 68.9,36.1 60.4,29.9 70.9,29.9" />
        <polygon points="133.4,20 136.6,29.9 147.1,29.9 138.6,36.1 141.8,46 133.4,39.8 125,46 128.2,36.1 119.7,29.9 130.2,29.9" />
        <polygon points="192.7,20 195.9,29.9 206.4,29.9 197.9,36.1 201.1,46 192.7,39.8 184.3,46 187.5,36.1 179,29.9 189.5,29.9" />
        <polygon points="252,20 255.2,29.9 265.7,29.9 257.2,36.1 260.4,46 252,39.8 243.6,46 246.8,36.1 238.3,29.9 248.8,29.9" />
      </g>
    </svg>
  );
}

const dashboardItem = {
  to: '/app',
  labelKey: 'dashboard',
  icon: LayoutDashboard,
  hoverEffect: 'bounce',
};

const gestionItems = [
  { to: '/alertas', labelKey: 'alertas', managerOnly: true, icon: Bell, hoverEffect: 'shake' },
  { to: '/calendario', labelKey: 'calendario', icon: Calendar, hoverEffect: 'bounce' },
  { to: '/clientes', labelKey: 'clientes', icon: Users, hoverEffect: 'pulse' },
  { to: '/ventas', labelKey: 'ventas', managerOnly: true, icon: ShoppingBag, hoverEffect: 'bounce' },
  { to: '/consentimientos', labelKey: 'consentimientos', icon: FileText, hoverEffect: 'rotate' },
  { to: '/cabinas', labelKey: 'cabinas', managerOnly: true, icon: Store, hoverEffect: 'pulse' },
  { to: '/empleados', labelKey: 'empleados', adminOnly: true, icon: UserCheck, hoverEffect: 'bounce' },
  { to: '/comunicaciones', labelKey: 'comunicaciones', icon: Mail, hoverEffect: 'shake' },
];

/* ── Sección Comercial (Fase 2) ──────────────────────────────────── */
const comercialItems = [
  { to: '/leads', labelKey: 'leads', icon: UserPlus, hoverEffect: 'bounce' },
  { to: '/proyectos', labelKey: 'proyectos', icon: FolderKanban, hoverEffect: 'pulse' },
  { to: '/presupuestos', labelKey: 'presupuestos', icon: Calculator, hoverEffect: 'rotate' },
  { to: '/seguimientos', labelKey: 'seguimientos', icon: Clock, hoverEffect: 'bounce' },
  { to: '/pipeline', labelKey: 'pipeline', icon: GitMerge, hoverEffect: 'pulse' },
  { to: '/insights', labelKey: 'insights', managerOnly: true, icon: TrendingUp, hoverEffect: 'bounce' },
];

const inventarioItems = [
  { to: '/tintas', labelKey: 'tintas', icon: Droplets, hoverEffect: 'pulse' },
  { to: '/agujas', labelKey: 'agujas', icon: Syringe, hoverEffect: 'shake' },
  { to: '/piercing', labelKey: 'piercing', icon: Sparkles, hoverEffect: 'bounce' },
  { to: '/materiales', labelKey: 'materiales', icon: Package, hoverEffect: 'rotate' },
];

const contabilidadItems = [
  { to: '/estadisticas', labelKey: 'estadisticas', managerOnly: true, icon: BarChart2, hoverEffect: 'bounce' },
  { to: '/gastos', labelKey: 'gastos', managerOnly: true, icon: Receipt, hoverEffect: 'shake' },
  { to: '/ingresos', labelKey: 'ingresos', managerOnly: true, icon: DollarSign, hoverEffect: 'bounce' },
  { to: '/contabilidad/recuento-diario', labelKey: 'recuento_diario', managerOnly: true, icon: Calculator, hoverEffect: 'rotate' },
  { to: '/contabilidad/liquidacion-artista', labelKey: 'mi_liquidacion', icon: Wallet, hoverEffect: 'pulse' },
  { to: '/contabilidad/liquidacion-estudio', labelKey: 'liq_estudio', managerOnly: true, icon: Building2, hoverEffect: 'bounce' },
  { to: '/contabilidad/recibos', labelKey: 'recibos', managerOnly: true, icon: FileCheck, hoverEffect: 'rotate' },
];

export default function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const { colorMode, toggleColorMode } = useContext(ThemeContext);
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`;

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-gray-900 w-64 flex-shrink-0">
      {/* Logo y Modo de Color (arriba del todo) */}
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Tattoo Studio</p>
            <p className="text-gray-500 text-xs mt-0.5">Gestión</p>
          </div>
        </div>

        {/* Botón de Modo Claro / Oscuro */}
        <motion.button
          initial="rest" whileHover="hover" whileTap="tap"
          onClick={toggleColorMode}
          className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700/60"
          title={`Cambiar a modo ${colorMode === 'dark' ? 'claro' : 'oscuro'}`}
        >
          <AnimatedIcon icon={colorMode === 'dark' ? Sun : Moon} hoverEffect="rotate" size={16} />
        </motion.button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <MotionNavLink to={dashboardItem.to} end initial="rest" whileHover="hover" whileTap="tap" className={linkClass}>
          <AnimatedIcon icon={dashboardItem.icon} hoverEffect={dashboardItem.hoverEffect} size={18} />
          {t(dashboardItem.labelKey)}
        </MotionNavLink>

        {/* Helper de filtrado por rol */}
        {(() => {
          const isArtista = usuario?.rol === 'artista';
          const filterItems = (items) => items.filter(i => {
            if (i.adminOnly && usuario?.rol !== 'admin') return false;
            if (i.managerOnly && isArtista) return false;
            return true;
          });

          const gItems = filterItems(gestionItems);
          const cItems = filterItems(comercialItems);
          const iItems = filterItems(inventarioItems);
          const contItems = filterItems(contabilidadItems);

          const renderNavLink = (item) => (
            <MotionNavLink key={item.to} to={item.to} initial="rest" whileHover="hover" whileTap="tap" className={linkClass}>
              <AnimatedIcon icon={item.icon} hoverEffect={item.hoverEffect || 'bounce'} size={18} />
              {t(item.labelKey)}
            </MotionNavLink>
          );

          return (
            <>
              {/* Gestión group */}
              {gItems.length > 0 && (
                <div className="pt-3">
                  <p className="px-4 pb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('gestion')}</p>
                  {gItems.map(renderNavLink)}
                </div>
              )}

              {/* Comercial group */}
              {cItems.length > 0 && (
                <div className="pt-3">
                  <p className="px-4 pb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('comercial')}</p>
                  {cItems.map(renderNavLink)}
                </div>
              )}

              {/* Inventario group */}
              {iItems.length > 0 && (
                <div className="pt-3">
                  <p className="px-4 pb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('inventario')}</p>
                  {iItems.map(renderNavLink)}
                </div>
              )}

              {/* Contabilidad group */}
              {contItems.length > 0 && (
                <div className="pt-3">
                  <p className="px-4 pb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('contabilidad')}</p>
                  {contItems.map(renderNavLink)}
                </div>
              )}
            </>
          );
        })()}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-800 flex flex-col gap-1">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-indigo-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {usuario?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 flex justify-between items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{usuario?.nombre}</p>
              <p className="text-gray-500 text-xs capitalize">{usuario?.rol}</p>
            </div>
            
            {/* Botón de Idioma destacado con bandera vectorial ocupando el lugar libre */}
            <motion.button
              initial="rest" whileHover="hover" whileTap="tap"
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="px-2.5 py-1.5 text-xs font-bold text-gray-200 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700 flex items-center gap-2 flex-shrink-0 shadow-sm"
              title="Cambiar idioma / Change language"
            >
              {lang === 'es' ? <FlagES className="w-5 h-3.5" /> : <FlagUS className="w-5 h-3.5" />}
              <span>{lang === 'es' ? 'ES' : 'EN'}</span>
            </motion.button>
          </div>
        </div>
        
        {(usuario?.rol === 'superadmin' || usuario?.email === 'baileyjrm@gmail.com') && (
          <MotionNavLink to="/superadmin" initial="rest" whileHover="hover" whileTap="tap" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-black text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors border border-red-900/50 mb-1">
            <AnimatedIcon icon={ShieldAlert} hoverEffect="shake" size={18} className="text-red-500" />
            Panel SuperAdmin
          </MotionNavLink>
        )}

        {(usuario?.rol === 'admin' || usuario?.rol === 'superadmin' || usuario?.email === 'baileyjrm@gmail.com') && (
          <MotionNavLink to="/configuracion" initial="rest" whileHover="hover" whileTap="tap" className={linkClass}>
            <AnimatedIcon icon={Settings} hoverEffect="rotate" size={18} />
            {t('configuracion')}
          </MotionNavLink>
        )}

        <motion.button
          initial="rest" whileHover="hover" whileTap="tap"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <AnimatedIcon icon={LogOut} hoverEffect="bounce" size={18} />
          {t('cerrar_sesion')}
        </motion.button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-800 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-semibold text-sm">Tattoo Studio</span>
          <motion.button
            initial="rest" whileHover="hover" whileTap="tap"
            onClick={toggleColorMode}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title={`Cambiar a modo ${colorMode === 'dark' ? 'claro' : 'oscuro'}`}
          >
            <AnimatedIcon icon={colorMode === 'dark' ? Sun : Moon} hoverEffect="rotate" size={18} />
          </motion.button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
