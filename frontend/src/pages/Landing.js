import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ─── Reactive Background Canvas ─────────────────────────────────────────────
function ReactiveBackground() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -999, y: -999 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h;
    const particles = [];
    const N = 70;

    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const onMove = (e) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY; };
    window.addEventListener('mousemove', onMove);

    class P {
      constructor() { this.reset(); }
      reset() {
        this.x = this.bx = Math.random() * w;
        this.y = this.by = Math.random() * h;
        this.r = Math.random() * 1.8 + 0.4;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.a = Math.random() * 0.45 + 0.1;
        const c = Math.random();
        this.color = c > 0.6 ? '#818cf8' : c > 0.3 ? '#a78bfa' : '#6366f1';
      }
      tick() {
        const dx = mouse.current.x - this.x;
        const dy = mouse.current.y - this.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 150) { const f = (150 - d) / 150; this.x -= dx * f * 0.045; this.y -= dy * f * 0.045; }
        else { this.x += (this.bx - this.x) * 0.018; this.y += (this.by - this.y) * 0.018; }
        this.bx += this.vx; this.by += this.vy;
        if (this.bx < 0 || this.bx > w) this.vx *= -1;
        if (this.by < 0 || this.by > h) this.vy *= -1;
      }
      draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.globalAlpha = this.a; ctx.fill();
      }
    }

    for (let i = 0; i < N; i++) particles.push(new P());

    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      // mouse glow
      const g = ctx.createRadialGradient(mouse.current.x, mouse.current.y, 0, mouse.current.x, mouse.current.y, 280);
      g.addColorStop(0, 'rgba(99,102,241,0.09)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // connections
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 95) { ctx.globalAlpha = (1 - d / 95) * 0.12; ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); }
        }
      }
      particles.forEach(p => { p.tick(); p.draw(); });
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMove); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// ─── Data ───────────────────────────────────────────────────────────────────
const features = [
  {
    gradient: 'from-indigo-500 to-violet-600',
    shadow: 'rgba(99,102,241,0.35)',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
      </svg>
    ),
    title: 'Calendario Inteligente',
    desc: 'Vista diaria, semanal y mensual. Crea citas en segundos. Detección automática de conflictos entre artistas y cabinas.',
  },
  {
    gradient: 'from-cyan-500 to-blue-600',
    shadow: 'rgba(6,182,212,0.35)',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Ficha de Clientes',
    desc: 'Historial completo de sesiones, fotos, alergias y notas. Toda la información de tu cliente accesible en segundos.',
  },
  {
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'rgba(16,185,129,0.35)',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/>
      </svg>
    ),
    title: 'Consentimientos Digitales',
    desc: 'Formularios con firma digital. Legalmente válidos, sin papel y archivados automáticamente en la nube.',
  },
  {
    gradient: 'from-orange-500 to-rose-600',
    shadow: 'rgba(249,115,22,0.35)',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><path d="M7 15h2M11 15h6"/>
      </svg>
    ),
    title: 'TPV y Punto de Venta',
    desc: 'Cobra sesiones, productos y servicios. Tickets, facturas y control de stock integrados en tiempo real.',
  },
  {
    gradient: 'from-violet-500 to-purple-700',
    shadow: 'rgba(139,92,246,0.35)',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><path d="M2 20h20"/>
      </svg>
    ),
    title: 'Estadísticas y Contabilidad',
    desc: 'Dashboard con ingresos, gastos y liquidaciones por artista. Exporta datos para tu gestor en un clic.',
  },
  {
    gradient: 'from-pink-500 to-rose-600',
    shadow: 'rgba(236,72,153,0.35)',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: 'Inventario y Materiales',
    desc: 'Control de tintas, agujas y materiales de piercing. Alertas automáticas de stock bajo.',
  },
];

const plans = [
  { id: 'basico', name: 'Starter', monthlyPrice: 29, yearlyPrice: 24, desc: 'Para estudios pequeños que arrancan.', features: ['Hasta 2 artistas', 'Calendario de citas', 'Gestión de clientes', 'Consentimientos digitales', 'Ficha de sesiones', 'Soporte por email'] },
  { id: 'pro', name: 'Pro', monthlyPrice: 59, yearlyPrice: 49, desc: 'Para estudios en crecimiento.', popular: true, features: ['Artistas ilimitados', 'Todo lo del Starter', 'TPV y punto de venta', 'Contabilidad y liquidaciones', 'Estadísticas avanzadas', 'Inventario y stock', 'Sincronización Google Calendar', 'Soporte prioritario'] },
];

const testimonials = [
  { name: 'Carlos M.', studio: 'Black Rose Tattoo, Madrid', text: 'Desde que uso InkFlow llevo el control de mi estudio sin esfuerzo. Los consentimientos digitales me han salvado la vida.', av: 'CM', color: 'from-indigo-600 to-violet-600' },
  { name: 'Ana Belén R.', studio: 'Luna Ink, Barcelona', text: 'El calendario es una maravilla. Mis clientes ya no se olvidan de las citas y tengo todo organizado en segundos.', av: 'AB', color: 'from-cyan-600 to-blue-600' },
  { name: 'Dario F.', studio: 'Skull & Roses, Valencia', text: 'Por fin un software hecho para estudios de verdad. El TPV me ahorra una hora al día como mínimo.', av: 'DF', color: 'from-emerald-600 to-teal-600' },
];

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Landing() {
  const [billing, setBilling] = useState('monthly');
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 20); window.addEventListener('scroll', f); return () => window.removeEventListener('scroll', f); }, []);

  return (
    <div className="min-h-screen text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#030712', color: '#fff' }}>
      <ReactiveBackground />

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-950/92 backdrop-blur-md border-b border-white/5 shadow-2xl' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/></svg>
            </div>
            <span className="font-bold text-xl">InkFlow</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Opiniones</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all">Iniciar sesión</Link>
            <Link to="/registro" className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>Empezar gratis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border text-sm font-medium px-4 py-1.5 rounded-full mb-8" style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.35)', color: '#a5b4fc' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Ahora con sincronización de Google Calendar
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            El software de gestión<br />
            <span style={{ background: 'linear-gradient(90deg,#818cf8,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              para estudios de tatuaje
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Calendario, clientes, consentimientos digitales, TPV y contabilidad. Todo en una plataforma.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/registro" className="flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)', boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}>
              Empezar 14 días gratis
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
            <a href="#features" className="flex items-center gap-2 text-gray-300 hover:text-white px-8 py-4 rounded-xl text-lg border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all">
              Ver funcionalidades
            </a>
          </div>
          <div className="flex justify-center gap-10 flex-wrap">
            {[{ n: '500+', l: 'Estudios activos' }, { n: '120k+', l: 'Citas gestionadas' }, { n: '98%', l: 'Satisfacción' }].map(({ n, l }) => (
              <div key={l} className="text-center"><div className="text-3xl font-black">{n}</div><div className="text-sm text-gray-500">{l}</div></div>
            ))}
          </div>
        </div>

        {/* App mockup */}
        <div className="max-w-4xl mx-auto mt-20 relative">
          <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'linear-gradient(to bottom, transparent 50%, #030712 100%)' }} />
          <div className="absolute -inset-px rounded-2xl opacity-60" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2),rgba(244,114,182,0.15))', filter: 'blur(1px)' }} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl overflow-hidden" style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.7)' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5" style={{ background: 'rgba(3,7,18,0.7)' }}>
              <div className="w-3 h-3 rounded-full bg-red-500/70"/><div className="w-3 h-3 rounded-full bg-yellow-500/70"/><div className="w-3 h-3 rounded-full bg-green-500/70"/>
              <div className="ml-4 max-w-xs bg-gray-800 rounded-md px-3 py-1 text-xs text-gray-500">app.inkflow.es</div>
            </div>
            <div className="flex h-64">
              <div className="w-14 border-r border-white/5 flex flex-col items-center py-4 gap-3" style={{ background: 'rgba(3,7,18,0.9)' }}>
                {[...Array(7)].map((_, i) => <div key={i} className={`w-8 h-8 rounded-lg ${i === 0 ? '' : 'bg-gray-800'}`} style={i === 0 ? { background: 'linear-gradient(135deg,#6366f1,#7c3aed)', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' } : {}} />)}
              </div>
              <div className="flex-1 p-4">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {['Citas hoy', 'Ingresos', 'Clientes', 'Pendientes'].map((label, i) => (
                    <div key={label} className="bg-gray-800 rounded-xl p-3 border border-white/5">
                      <div className="text-xs text-gray-500 mb-1">{label}</div>
                      <div className="text-lg font-bold" style={{ color: i === 0 ? '#818cf8' : 'white' }}>{['8', '2.450€', '312', '3'][i]}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-800 rounded-xl p-3 border border-white/5 h-32">
                  <div className="text-xs text-gray-500 mb-2">Calendario — Semana del 11 al 17 ago.</div>
                  <div className="grid grid-cols-7 gap-1 h-20">
                    {['L','M','X','J','V','S','D'].map((day, col) => (
                      <div key={day} className="flex flex-col gap-1">
                        <div className="text-xs text-gray-600 text-center">{day}</div>
                        {col === 1 && <div className="flex-1 rounded text-[8px] px-1 py-0.5" style={{ background: 'rgba(99,102,241,0.35)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)' }}>Carlos</div>}
                        {col === 2 && <div className="flex-1 rounded text-[8px] px-1 py-0.5" style={{ background: 'rgba(139,92,246,0.35)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.4)' }}>Ana</div>}
                        {col === 4 && <div className="flex-1 rounded text-[8px] px-1 py-0.5" style={{ background: 'rgba(236,72,153,0.35)', color: '#f9a8d4', border: '1px solid rgba(236,72,153,0.4)' }}>Díaz</div>}
                        {col === 5 && <><div className="rounded text-[8px] px-1 py-0.5" style={{ background: 'rgba(99,102,241,0.35)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)' }}>Luis</div><div className="rounded text-[8px] px-1 py-0.5 mt-1" style={{ background: 'rgba(139,92,246,0.35)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.4)' }}>Marta</div></>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Todo lo que necesita tu estudio</h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">Hemos hablado con cientos de tatuadores para crear la herramienta que realmente necesitan.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group relative rounded-2xl p-7 border border-white/5 hover:border-white/15 transition-all duration-300 hover:-translate-y-2 cursor-default overflow-hidden" style={{ background: 'rgba(17,24,39,0.8)' }}>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: `inset 0 0 50px ${f.shadow}` }} />
                <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-white`} style={{ background: `linear-gradient(135deg,${f.gradient.includes('indigo') ? '#6366f1,#7c3aed' : f.gradient.includes('cyan') ? '#06b6d4,#2563eb' : f.gradient.includes('emerald') ? '#10b981,#0d9488' : f.gradient.includes('orange') ? '#f97316,#e11d48' : f.gradient.includes('violet') ? '#8b5cf6,#6d28d9' : '#ec4899,#e11d48'})`, boxShadow: `0 8px 24px ${f.shadow}` }}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative py-24 px-6 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16"><h2 className="text-4xl font-black mb-4">Lo que dicen nuestros clientes</h2></div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-900 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}</div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: `linear-gradient(135deg,${t.color.includes('indigo') ? '#4f46e5,#6d28d9' : t.color.includes('cyan') ? '#0891b2,#1d4ed8' : '#059669,#0f766e'})` }}>{t.av}</div>
                  <div><div className="text-sm font-semibold text-white">{t.name}</div><div className="text-xs text-gray-500">{t.studio}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-24 px-6 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Precios simples y transparentes</h2>
            <p className="text-gray-400 mb-8">Sin sorpresas. Cancela cuando quieras.</p>
            <div className="inline-flex bg-gray-900 border border-white/10 rounded-xl p-1">
              {['monthly','yearly'].map(b => (
                <button key={b} onClick={() => setBilling(b)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${billing === b ? 'text-white' : 'text-gray-400 hover:text-white'}`} style={billing === b ? { background: 'linear-gradient(135deg,#6366f1,#7c3aed)' } : {}}>
                  {b === 'monthly' ? 'Mensual' : <>Anual <span className="text-emerald-400 text-xs font-bold">−17%</span></>}
                </button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className={`relative rounded-2xl p-8 border transition-all hover:-translate-y-1 ${plan.popular ? 'border-indigo-500/50' : 'border-white/10 bg-gray-900 hover:border-white/20'}`}
                   style={plan.popular ? { background: 'linear-gradient(160deg,rgba(99,102,241,0.12),rgba(139,92,246,0.07))' } : {}}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-4 py-1.5 rounded-full" style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>MÁS POPULAR</div>}
                <div className="mb-6"><div className="text-xl font-bold mb-1">{plan.name}</div><div className="text-gray-400 text-sm">{plan.desc}</div></div>
                <div className="flex items-end gap-1 mb-1"><span className="text-5xl font-black">{billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}€</span><span className="text-gray-400 mb-2">/mes</span></div>
                {billing === 'yearly' && <div className="text-xs text-emerald-400 mb-1">Ahorras {(plan.monthlyPrice - plan.yearlyPrice) * 12}€ al año</div>}
                <div className="text-xs mb-6" style={{ color: '#818cf8' }}>✓ 14 días gratis, sin tarjeta</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#818cf8"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link to={`/registro?plan=${plan.id}`} className={`block text-center font-bold py-3 rounded-xl text-sm transition-all ${plan.popular ? 'text-white hover:scale-[1.02]' : 'bg-gray-800 hover:bg-gray-700 text-white border border-white/10'}`}
                      style={plan.popular ? { background: 'linear-gradient(135deg,#6366f1,#7c3aed)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' } : {}}>
                  Empezar gratis →
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-10">¿Necesitas algo personalizado? <a href="mailto:hola@inkflow.es" className="text-indigo-400 hover:underline">Contacta con nosotros</a></p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl p-12 overflow-hidden border border-indigo-500/30" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.12),rgba(244,114,182,0.08))' }}>
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.15),transparent)' }} />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.15),transparent)' }} />
            <h2 className="relative text-4xl md:text-5xl font-black mb-4">Empieza hoy,<br />es gratis</h2>
            <p className="relative text-gray-300 mb-8 text-lg">14 días de prueba completa. Sin tarjeta. Sin compromisos.</p>
            <Link to="/registro" className="relative inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)', boxShadow: '0 8px 30px rgba(99,102,241,0.45)' }}>
              Crear mi cuenta gratis
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-10 px-6 z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }}>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/></svg>
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
