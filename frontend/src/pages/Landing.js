import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, FileSignature, CreditCard, BarChart3, Package, ArrowRight, Check, Clock, DollarSign, BarChart2, Sparkles, Facebook, Instagram, Eye, Cookie, CheckCircle, FileText, HelpCircle, MapPin, Phone, Mail } from 'lucide-react';

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
    const N = 80;

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
        this.r = Math.random() * 1.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.a = Math.random() * 0.5 + 0.1;
        const c = Math.random();
        this.color = c > 0.8 ? '#ef4444' : c > 0.4 ? '#b91c1c' : '#4b5563'; // reds and greys
      }
      tick() {
        const dx = mouse.current.x - this.x;
        const dy = mouse.current.y - this.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 150) { const f = (150 - d) / 150; this.x -= dx * f * 0.05; this.y -= dy * f * 0.05; }
        else { this.x += (this.bx - this.x) * 0.02; this.y += (this.by - this.y) * 0.02; }
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
      const g = ctx.createRadialGradient(mouse.current.x, mouse.current.y, 0, mouse.current.x, mouse.current.y, 250);
      g.addColorStop(0, 'rgba(220,38,38,0.08)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // connections
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) { ctx.globalAlpha = (1 - d / 100) * 0.15; ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); }
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

const features = [
  {
    gradient: 'from-[#3b0764] to-[#1e1b4b]',
    shadow: 'rgba(147, 51, 234, 0.2)',
    borderColor: 'border-purple-800/50',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    icon: <Clock className="w-6 h-6" />,
    title: 'Gestiona tu Tiempo',
    desc: 'Registra cómo distribuyes tus horas entre tatuar, diseñar, administración y más',
  },
  {
    gradient: 'from-[#134e4a] to-[#042f2e]',
    shadow: 'rgba(20, 184, 166, 0.2)',
    borderColor: 'border-teal-800/50',
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-400',
    icon: <DollarSign className="w-6 h-6" />,
    title: 'Maximiza Ingresos',
    desc: 'Descubre qué actividades son más rentables y optimiza tu tarifa por hora',
  },
  {
    gradient: 'from-[#831843] to-[#4c0519]',
    shadow: 'rgba(236, 72, 153, 0.2)',
    borderColor: 'border-pink-800/50',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-400',
    icon: <BarChart2 className="w-6 h-6" />,
    title: 'Visualiza Tendencias',
    desc: 'Gráficos y métricas que te muestran tu evolución a lo largo del tiempo',
  },
  {
    gradient: 'from-[#064e3b] to-[#022c22]',
    shadow: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'border-emerald-800/50',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Análisis con IA',
    desc: 'Recomendaciones personalizadas basadas en tu historial completo',
  },
];

const plans = [
  { id: 'basico', name: 'Starter', monthlyPrice: 29, yearlyPrice: 24, desc: 'Para estudios pequeños o artistas independientes.', features: ['Hasta 2 artistas', 'Calendario de citas', 'Gestión de clientes', 'Consentimientos digitales', 'Ficha de sesiones', 'Soporte prioritario'] },
  { id: 'pro', name: 'Pro', monthlyPrice: 59, yearlyPrice: 49, desc: 'Para estudios de alto volumen.', popular: true, features: ['Artistas ilimitados', 'Todo lo del Starter', 'TPV y punto de venta', 'Contabilidad y liquidaciones', 'Estadísticas avanzadas', 'Inventario y stock', 'Sincronización Google Calendar', 'Soporte 24/7'] },
];



// ─── Page ────────────────────────────────────────────────────────────────────
export default function Landing() {
  const [billing, setBilling] = useState('monthly');
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 20); window.addEventListener('scroll', f); return () => window.removeEventListener('scroll', f); }, []);

  return (
    <div className="min-h-screen text-gray-200" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#0a0a0a' }}>
      <ReactiveBackground />

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/5 shadow-2xl' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-2xl tracking-tighter text-white uppercase" style={{ letterSpacing: '-0.05em' }}>KuroIchi</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-bold tracking-wide text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">HERRAMIENTAS</a>
            <a href="#pricing" className="hover:text-white transition-colors">TARIFAS</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold tracking-wider text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all uppercase">Acceder</Link>
            <Link to="/registro" className="text-sm font-black text-white px-5 py-2 rounded-lg transition-all hover:scale-105 uppercase tracking-wider border border-red-500/30 shadow-[0_4px_16px_rgba(220,38,38,0.25)]" style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)' }}>Pruébalo</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-8 shadow-sm" style={{ background: 'rgba(220,38,38,0.1)', borderColor: 'rgba(220,38,38,0.3)', color: '#fca5a5' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Sincronización total con Google Calendar
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 uppercase tracking-tighter text-white" style={{ letterSpacing: '-0.03em' }}>
            Gobierna tu estudio,<br />
            <span className="bg-gradient-to-r from-red-500 via-red-600 to-amber-400 bg-clip-text text-transparent">
              domina la tinta
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            El sistema de gestión creado para la verdadera industria del tatuaje. Citas, finanzas, inventario y consentimientos en una plataforma indestructible.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link to="/registro" className="flex items-center gap-3 text-white font-black px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 uppercase tracking-wide border border-red-500/30 shadow-[0_8px_30px_rgba(220,38,38,0.4)]" style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)' }}>
              14 días a prueba de fuego
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
          <div className="flex justify-center gap-12 flex-wrap border-y border-white/5 py-10" style={{ background: 'rgba(0,0,0,0.3)' }}>
            {[{ n: '800+', l: 'Estudios' }, { n: '2M+', l: 'Tatuajes curados' }, { n: '100%', l: 'Puro control' }].map(({ n, l }) => (
              <div key={l} className="text-center"><div className="text-4xl font-black text-white">{n}</div><div className="text-xs font-bold tracking-widest text-gray-500 uppercase mt-1">{l}</div></div>
            ))}
          </div>
        </div>

        {/* App mockup */}
        <div className="max-w-5xl mx-auto mt-20 relative hidden md:block">
          <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'linear-gradient(to bottom, transparent 30%, #0a0a0a 100%)' }} />
          <div className="absolute -inset-px rounded-2xl opacity-40" style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.4),rgba(153,27,27,0.2),rgba(251,191,36,0.15))', filter: 'blur(2px)' }} />
          <div className="relative bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black">
              <div className="w-3 h-3 rounded-full bg-red-600"/><div className="w-3 h-3 rounded-full bg-yellow-600"/><div className="w-3 h-3 rounded-full bg-green-600"/>
              <div className="ml-4 bg-[#1a1a1a] rounded px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-gray-500 border border-white/5">app.kuroichi.com</div>
            </div>
            <div className="flex h-[320px]">
              <div className="w-16 border-r border-white/5 flex flex-col items-center py-4 gap-4 bg-black">
                <div className="font-black text-white tracking-tighter text-sm mb-2 opacity-80 uppercase">KI</div>
                {[...Array(6)].map((_, i) => <div key={i} className={`w-8 h-8 rounded-lg ${i === 0 ? 'border border-red-500/50' : 'bg-[#1a1a1a]'}`} style={i === 0 ? { background: 'linear-gradient(135deg,#dc2626,#991b1b)', boxShadow: '0 4px 12px rgba(220,38,38,0.4)' } : {}} />)}
              </div>
              <div className="flex-1 p-6 bg-[#0a0a0a]">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {['Citas hoy', 'Caja del día', 'Consentimientos', 'Stock crítico'].map((label, i) => (
                    <div key={label} className="bg-[#141414] rounded-xl p-4 border border-white/5 shadow-lg">
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">{label}</div>
                      <div className="text-2xl font-black" style={{ color: i === 0 ? '#ef4444' : i === 1 ? '#fbbf24' : 'white' }}>{['12', '1.850€', '10', '2 tintas'][i]}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-[#141414] rounded-xl p-4 border border-white/5 h-40 shadow-lg">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Calendario Semanal — Agosto</div>
                  <div className="grid grid-cols-7 gap-2 h-24">
                    {['L','M','X','J','V','S','D'].map((day, col) => (
                      <div key={day} className="flex flex-col gap-1">
                        <div className="text-xs font-bold text-gray-600 text-center mb-1">{day}</div>
                        {col === 1 && <div className="flex-1 rounded text-[9px] font-bold px-2 py-1" style={{ background: 'rgba(220,38,38,0.2)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.4)' }}>Realismo</div>}
                        {col === 2 && <div className="flex-1 rounded text-[9px] font-bold px-2 py-1" style={{ background: 'rgba(251,191,36,0.15)', color: '#fcd34d', border: '1px solid rgba(251,191,36,0.3)' }}>Tradicional</div>}
                        {col === 4 && <div className="flex-1 rounded text-[9px] font-bold px-2 py-1" style={{ background: 'rgba(75,85,99,0.3)', color: '#d1d5db', border: '1px solid rgba(75,85,99,0.5)' }}>Piercing</div>}
                        {col === 5 && <><div className="rounded text-[9px] font-bold px-2 py-1" style={{ background: 'rgba(220,38,38,0.2)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.4)' }}>Revisión</div><div className="rounded text-[9px] font-bold px-2 py-1 mt-1" style={{ background: 'rgba(251,191,36,0.15)', color: '#fcd34d', border: '1px solid rgba(251,191,36,0.3)' }}>Blackwork</div></>}
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
      <section id="features" className="relative py-32 px-6 z-10 border-t border-white/5 bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Todo lo que necesitas</h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto font-medium">Una plataforma completa diseñada específicamente para estudios de tatuajes</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className={`group relative rounded-2xl p-8 border ${f.borderColor} transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-gradient-to-br ${f.gradient}`}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${f.shadow}, transparent 70%)` }} />
                
                <div className="flex flex-col items-center text-center">
                  <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${f.iconBg} ${f.iconColor}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-32 px-6 z-10 border-t border-white/5 bg-[#080808]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter text-white">Planes y Tarifas</h2>
            <p className="text-gray-400 mb-10 text-lg font-medium">Todo el poder, sin ataduras.</p>
            <div className="inline-flex bg-[#1a1a1a] border border-white/10 rounded-xl p-1.5 shadow-xl">
              {['monthly','yearly'].map(b => (
                <button key={b} onClick={() => setBilling(b)} className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${billing === b ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`} style={billing === b ? { background: 'linear-gradient(135deg,#dc2626,#991b1b)' } : {}}>
                  {b === 'monthly' ? 'Mensual' : <>Anual <span className="text-red-300 text-xs font-black ml-1">−17%</span></>}
                </button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.id} className={`relative rounded-3xl p-10 border transition-all hover:-translate-y-2 ${plan.popular ? 'border-red-600/50 shadow-[0_0_40px_rgba(220,38,38,0.15)] bg-[#111]' : 'border-white/10 bg-[#0d0d0d] hover:border-white/20'}`}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full" style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)', boxShadow: '0 4px 16px rgba(220,38,38,0.4)' }}>Elección del Jefe</div>}
                <div className="mb-8"><div className="text-2xl font-black mb-2 uppercase tracking-tight text-white">{plan.name}</div><div className="text-gray-400 text-sm font-medium">{plan.desc}</div></div>
                <div className="flex items-end gap-1 mb-2"><span className="text-6xl font-black tracking-tighter text-white">{billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}€</span><span className="text-gray-500 mb-2 font-bold uppercase">/mes</span></div>
                {billing === 'yearly' && <div className="text-xs text-red-500 font-bold mb-2 uppercase">Ahorras {(plan.monthlyPrice - plan.yearlyPrice) * 12}€ al año</div>}
                <div className="text-xs font-bold uppercase tracking-wide mb-8" style={{ color: '#fca5a5' }}>✓ 14 días gratis, cancela cuando quieras</div>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm font-medium text-gray-300">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-red-900/30 border border-red-500/50">
                        <Check className="w-3 h-3 text-red-400" strokeWidth={3} />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link to={`/registro?plan=${plan.id}`} className={`block text-center font-black uppercase tracking-widest py-4 rounded-xl text-sm transition-all ${plan.popular ? 'text-white hover:scale-[1.03]' : 'bg-[#1a1a1a] hover:bg-[#222] text-white border border-white/10'}`}
                      style={plan.popular ? { background: 'linear-gradient(135deg,#dc2626,#991b1b)', boxShadow: '0 8px 24px rgba(220,38,38,0.3)' } : {}}>
                  Comenzar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-6 z-10 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-[3rem] p-16 overflow-hidden border border-red-900/30 bg-[#0d0d0d]">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle,rgba(220,38,38,0.4),transparent 70%)' }} />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none opacity-10" style={{ background: 'radial-gradient(circle,rgba(251,191,36,0.4),transparent 70%)' }} />
            <div className="font-black text-4xl tracking-tighter text-white uppercase text-center mb-8" style={{ letterSpacing: '-0.05em' }}>KuroIchi</div>
            <h2 className="relative text-5xl md:text-6xl font-black mb-6 uppercase tracking-tighter text-white">Únete a los Profesionales</h2>
            <p className="relative text-gray-400 mb-10 text-lg font-medium max-w-xl mx-auto">14 días de prueba con todas las funcionalidades habilitadas. Da el salto y profesionaliza tu estudio hoy mismo.</p>
            <Link to="/registro" className="relative inline-flex items-center gap-3 text-white font-black px-10 py-5 rounded-2xl text-lg transition-all hover:scale-105 uppercase tracking-wide border border-red-500/30 shadow-[0_10px_40px_rgba(220,38,38,0.3)]" style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)' }}>
              Crear mi cuenta gratis
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>


      <footer className="border-t border-white/5 bg-[#050505] pt-16 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-sm text-gray-300">
            {/* Column 1: Logo and Social */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="mb-8">
                <div className="text-center font-serif">
                  <div className="text-[10px] tracking-[0.3em] text-gray-400 mb-1">EST. 2016</div>
                  <div className="text-3xl font-black tracking-widest text-white border-y border-white/20 py-2 my-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                    BLACK <span className="mx-2 text-xl align-middle">⚔️</span> BLOOD
                  </div>
                  <div className="text-sm tracking-[0.3em] text-white font-light">TATTOO STUDIO</div>
                </div>
              </div>
              <div className="flex gap-4 mt-2">
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-[#c29b38] text-black hover:bg-white transition-colors rounded shadow-lg">
                  <Facebook className="w-5 h-5 fill-current" strokeWidth={0} />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-[#c29b38] text-black hover:bg-white transition-colors rounded shadow-lg">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-[#c29b38] text-black hover:bg-white transition-colors rounded shadow-lg">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.34 2.88 2.88 0 012.31-4.53 2.66 2.66 0 011.04.2v-3.46a6.34 6.34 0 00-6.28 6.5A6.36 6.36 0 0010.5 22a6.38 6.38 0 006.32-6.5V9.41a8.4 8.4 0 005.15 1.76V7.62a4.9 4.9 0 01-2.38-.93z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Links */}
            <div>
              <h4 className="text-[#c29b38] font-bold text-lg mb-6 uppercase tracking-wider">Enlaces de Interés</h4>
              <ul className="space-y-4 font-medium text-gray-300">
                <li><Link to="/legal/privacidad" className="flex items-center gap-3 hover:text-white transition-colors"><Eye className="w-4 h-4 text-[#c29b38]" /> Política de Privacidad</Link></li>
                <li><Link to="/legal/cookies" className="flex items-center gap-3 hover:text-white transition-colors"><Cookie className="w-4 h-4 text-[#c29b38]" /> Política de Cookies</Link></li>
                <li><Link to="/legal/terminos" className="flex items-center gap-3 hover:text-white transition-colors"><CheckCircle className="w-4 h-4 text-[#c29b38]" /> Condiciones Generales</Link></li>
                <li><Link to="/legal/aviso-legal" className="flex items-center gap-3 hover:text-white transition-colors"><FileText className="w-4 h-4 text-[#c29b38]" /> Aviso Legal</Link></li>
                <li><Link to="/faq" className="flex items-center gap-3 hover:text-white transition-colors"><HelpCircle className="w-4 h-4 text-[#c29b38]" /> FAQ</Link></li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h4 className="text-[#c29b38] font-bold text-lg mb-6 uppercase tracking-wider">Información de Contacto</h4>
              <ul className="space-y-4 font-medium text-gray-300">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#c29b38] shrink-0 mt-0.5" />
                  <span>Av. de Galicia, 15, 27700 Ribadeo, Lugo, España</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#c29b38] shrink-0" />
                  <span>(+34) 611 15 69 33</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#c29b38] shrink-0" />
                  <span>blackbloodartstudio@gmail.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#c29b38] shrink-0" />
                  <span>LUN - VIE: 12:00h a 20:00h</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
