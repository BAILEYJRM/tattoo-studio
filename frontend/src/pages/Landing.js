import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ─── Feature data ──────────────────────────────────────────────────────────────
const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Calendario Inteligente',
    desc: 'Vista diaria, semanal y mensual. Crea citas en segundos haciendo clic en cualquier hueco. Detección automática de conflictos.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Ficha de Clientes',
    desc: 'Historial completo de sesiones, fotos, alergias y consentimientos. Toda la info de tu cliente en un solo lugar.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Consentimientos Digitales',
    desc: 'Genera y envía formularios de consentimiento con firma digital. Legalmente válidos, sin papel y archivados automáticamente.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'TPV y Punto de Venta',
    desc: 'Cobra sesiones, productos y servicios directamente desde la app. Tickets, facturas y control de stock integrados.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Estadísticas y Contabilidad',
    desc: 'Dashboard con ingresos, gastos y liquidaciones por artista. Exporta datos para tu gestor en un clic.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: 'Inventario y Materiales',
    desc: 'Control de tintas, agujas y materiales de piercing con alertas de stock bajo automáticas.',
  },
];

const plans = [
  {
    id: 'basico',
    name: 'Starter',
    monthlyPrice: 29,
    yearlyPrice: 24,
    desc: 'Para estudios pequeños que arrancan.',
    features: [
      'Hasta 2 artistas',
      'Calendario de citas',
      'Gestión de clientes',
      'Consentimientos digitales',
      'Ficha de sesiones',
      'Soporte por email',
    ],
    cta: 'Empezar gratis',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 59,
    yearlyPrice: 49,
    desc: 'Para estudios en crecimiento.',
    popular: true,
    features: [
      'Artistas ilimitados',
      'Todo lo del plan Starter',
      'TPV y punto de venta',
      'Contabilidad y liquidaciones',
      'Estadísticas avanzadas',
      'Inventario y stock',
      'Sincronización Google Calendar',
      'Soporte prioritario',
    ],
    cta: 'Empezar gratis',
  },
];

const testimonials = [
  {
    name: 'Carlos M.',
    studio: 'Black Rose Tattoo, Madrid',
    text: 'Desde que uso InkFlow llevo el control de mi estudio sin esfuerzo. Los consentimientos digitales me han salvado la vida.',
    avatar: 'CM',
  },
  {
    name: 'Ana Belén R.',
    studio: 'Luna Ink, Barcelona',
    text: 'El calendario es una maravilla. Mis clientes ya no se olvidan de las citas y yo tengo todo organizado en segundos.',
    avatar: 'AB',
  },
  {
    name: 'Dario F.',
    studio: 'Skull & Roses, Valencia',
    text: 'Por fin un software hecho para estudios de tatuajes de verdad. El TPV me ahorra una hora al día como mínimo.',
    avatar: 'DF',
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function Landing() {
  const [billing, setBilling] = useState('monthly'); // monthly | yearly
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-950/90 backdrop-blur border-b border-white/5 shadow-xl' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">InkFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Opiniones</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
              Iniciar sesión
            </Link>
            <Link to="/registro" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Ahora con sincronización de Google Calendar
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            El software de gestión<br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              para estudios de tatuaje
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Calendario, clientes, consentimientos digitales, TPV y contabilidad.
            Todo lo que necesita tu estudio, en una sola plataforma.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/registro"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-indigo-600/25"
            >
              Empezar 14 días gratis
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 text-gray-300 hover:text-white px-8 py-4 rounded-xl text-lg border border-white/10 hover:border-white/20 transition-all"
            >
              Ver funcionalidades
            </a>
          </div>
          
          {/* Social proof numbers */}
          <div className="flex items-center justify-center gap-8 text-center flex-wrap">
            {[
              { num: '500+', label: 'Estudios activos' },
              { num: '120k+', label: 'Citas gestionadas' },
              { num: '98%', label: 'Satisfacción' },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="text-3xl font-black text-white">{num}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* App screenshot mock */}
        <div className="max-w-5xl mx-auto mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950 z-10 pointer-events-none" style={{ top: '60%' }} />
          <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-gray-950/50">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="ml-4 flex-1 max-w-xs bg-gray-800 rounded-md px-3 py-1 text-xs text-gray-500">app.inkflow.es</div>
            </div>
            {/* Dashboard mockup */}
            <div className="flex h-80">
              {/* Sidebar */}
              <div className="w-14 bg-gray-950 border-r border-white/5 flex flex-col items-center py-4 gap-3">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`w-8 h-8 rounded-lg ${i === 0 ? 'bg-indigo-600' : 'bg-gray-800'}`} />
                ))}
              </div>
              {/* Main content */}
              <div className="flex-1 p-4 bg-gray-900">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {['Citas hoy', 'Ingresos', 'Clientes', 'Pendientes'].map((label, i) => (
                    <div key={label} className="bg-gray-800 rounded-xl p-3">
                      <div className="text-xs text-gray-500 mb-1">{label}</div>
                      <div className={`text-lg font-bold ${i === 0 ? 'text-indigo-400' : 'text-white'}`}>
                        {['8', '2.450€', '312', '3'][i]}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Calendar mockup */}
                <div className="bg-gray-800 rounded-xl p-3 h-44">
                  <div className="text-xs text-gray-500 mb-3">Calendario — Semana del 11 al 17 ago.</div>
                  <div className="grid grid-cols-7 gap-1 h-32">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, col) => (
                      <div key={day} className="flex flex-col gap-1">
                        <div className="text-xs text-gray-600 text-center">{day}</div>
                        {col === 1 && <div className="flex-1 bg-indigo-600/40 rounded text-[9px] text-indigo-300 px-1 py-0.5">Carlos · 10:00</div>}
                        {col === 2 && <div className="flex-1 bg-violet-600/40 rounded text-[9px] text-violet-300 px-1 py-0.5">Ana · 11:30</div>}
                        {col === 4 && <div className="flex-1 bg-pink-600/40 rounded text-[9px] text-pink-300 px-1 py-0.5">Díaz · 16:00</div>}
                        {col === 5 && (
                          <>
                            <div className="bg-indigo-600/40 rounded text-[9px] text-indigo-300 px-1 py-0.5">Luis · 10:00</div>
                            <div className="bg-violet-600/40 rounded text-[9px] text-violet-300 px-1 py-0.5">Marta · 12:00</div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Todo lo que necesita tu estudio</h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Hemos hablado con cientos de tatuadores para crear la herramienta que realmente necesitan.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-gray-900 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-900/20"
              >
                <div className="w-12 h-12 bg-indigo-600/15 text-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600/25 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 px-6 bg-gray-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Lo que dicen nuestros clientes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-900 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">{t.avatar}</div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.studio}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Precios simples y transparentes</h2>
            <p className="text-gray-400 mb-8">Sin sorpresas. Cancela cuando quieras.</p>
            {/* Billing toggle */}
            <div className="inline-flex bg-gray-900 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${billing === 'monthly' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${billing === 'yearly' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Anual <span className="text-xs text-indigo-400 font-bold">-17%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 border ${plan.popular ? 'border-indigo-500 bg-indigo-600/5' : 'border-white/10 bg-gray-900'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    MÁS POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-xl font-bold text-white mb-1">{plan.name}</div>
                  <div className="text-gray-400 text-sm">{plan.desc}</div>
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black text-white">
                    {billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}€
                  </span>
                  <span className="text-gray-400 mb-2">/mes</span>
                </div>
                {billing === 'yearly' && (
                  <div className="text-xs text-indigo-400 mb-4">Facturado anualmente · Ahorras {(plan.monthlyPrice - plan.yearlyPrice) * 12}€ al año</div>
                )}
                <div className="text-xs text-green-400 mb-6">✓ 14 días gratis, sin tarjeta de crédito</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/registro?plan=${plan.id}`}
                  className={`block text-center font-bold py-3 rounded-xl text-sm transition-all ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 hover:scale-[1.02]'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                >
                  {plan.cta} →
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ strip */}
          <p className="text-center text-sm text-gray-500 mt-10">
            ¿Tienes más de 5 artistas o necesitas algo personalizado?{' '}
            <a href="mailto:hola@inkflow.es" className="text-indigo-400 hover:underline">Contacta con nosotros</a>
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Empieza hoy,<br />es gratis
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              14 días de prueba completa. Sin tarjeta. Sin compromisos.
            </p>
            <Link
              to="/registro"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-indigo-600/30"
            >
              Crear mi cuenta gratis
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z" />
              </svg>
            </div>
            <span className="text-gray-400 text-sm">© 2026 InkFlow. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="mailto:hola@inkflow.es" className="hover:text-white transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
