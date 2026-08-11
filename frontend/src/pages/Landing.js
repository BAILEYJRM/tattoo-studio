import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, FileSignature, CreditCard, BarChart3, Package, ArrowRight, Check } from 'lucide-react';

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

// ─── Data ───────────────────────────────────────────────────────────────────
const features = [
  {
    gradient: 'from-red-600 to-red-800',
    shadow: 'rgba(220,38,38,0.35)',
    icon: <CalendarDays className="w-8 h-8" />,
    title: 'Calendario de Acero',
    desc: 'Vista diaria, semanal y mensual. Crea citas en segundos. Evita conflictos entre artistas y espacios de trabajo.',
  },
  {
    gradient: 'from-gray-600 to-gray-900',
    shadow: 'rgba(75,85,99,0.35)',
    icon: <Users className="w-8 h-8" />,
    title: 'Ficha de Clientes',
    desc: 'Historial completo de sesiones, fotos de tatuajes curados, alergias y notas confidenciales.',
  },
  {
    gradient: 'from-yellow-600 to-yellow-800',
    shadow: 'rgba(202,138,4,0.35)',
    icon: <FileSignature className="w-8 h-8" />,
    title: 'Consentimientos Seguros',
    desc: 'Firma digital vinculante. Archivo en la nube para proteger al estudio legalmente en todo momento.',
  },
  {
    gradient: 'from-orange-600 to-orange-800',
    shadow: 'rgba(234,88,12,0.35)',
    icon: <CreditCard className="w-8 h-8" />,
    title: 'TPV Implacable',
    desc: 'Cobra sesiones, depósitos, joyería y merchan. Emite tickets y facturas directas al instante.',
  },
  {
    gradient: 'from-red-700 to-gray-900',
    shadow: 'rgba(185,28,28,0.35)',
    icon: <BarChart3 className="w-8 h-8" />,
    title: 'Contabilidad Clara',
    desc: 'Ingresos, gastos y liquidaciones porcentuales por artista. Datos en bruto para tu gestor.',
  },
  {
    gradient: 'from-stone-600 to-stone-800',
    shadow: 'rgba(87,83,78,0.35)',
    icon: <Package className="w-8 h-8" />,
    title: 'Inventario y Material',
    desc: 'Control estricto de tintas, cartuchos y grips. Notificaciones cuando el stock llegue al límite.',
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
            <img src="/inkuro-logo.png" alt="Inkuro" className="w-10 h-10 object-cover rounded shadow-lg border border-red-500/20" />
            <span className="font-black text-2xl tracking-tighter text-white uppercase" style={{ letterSpacing: '-0.05em' }}>Inkuro</span>
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
              <div className="ml-4 bg-[#1a1a1a] rounded px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-gray-500 border border-white/5">app.inkuro.com</div>
            </div>
            <div className="flex h-[320px]">
              <div className="w-16 border-r border-white/5 flex flex-col items-center py-4 gap-4 bg-black">
                <img src="/inkuro-logo.png" className="w-8 h-8 rounded mb-2 opacity-80" alt="I" />
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter text-white">Tu estudio, tus reglas</h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto font-medium">Hemos depurado años de feedback de artistas profesionales para forjar herramientas de precisión.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="group relative rounded-2xl p-8 border border-white/5 hover:border-red-900/50 transition-all duration-300 hover:-translate-y-1 cursor-default overflow-hidden bg-[#111]">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${f.shadow}, transparent 70%)` }} />
                <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-white`} style={{ background: `linear-gradient(135deg,${f.gradient.includes('red') ? '#dc2626,#7f1d1d' : f.gradient.includes('gray') ? '#4b5563,#1f2937' : f.gradient.includes('yellow') ? '#ca8a04,#854d0e' : f.gradient.includes('orange') ? '#ea580c,#9a3412' : '#57534e,#292524'})`, boxShadow: `0 8px 24px ${f.shadow}` }}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-black text-white mb-3 tracking-wide">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">{f.desc}</p>
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
            <img src="/inkuro-logo.png" className="w-16 h-16 mx-auto mb-8 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.3)] border border-red-500/20" alt="Inkuro Icon" />
            <h2 className="relative text-5xl md:text-6xl font-black mb-6 uppercase tracking-tighter text-white">Únete al culto</h2>
            <p className="relative text-gray-400 mb-10 text-lg font-medium max-w-xl mx-auto">14 días de prueba con todas las funcionalidades habilitadas. Da el salto y profesionaliza tu estudio hoy mismo.</p>
            <Link to="/registro" className="relative inline-flex items-center gap-3 text-white font-black px-10 py-5 rounded-2xl text-lg transition-all hover:scale-105 uppercase tracking-wide border border-red-500/30 shadow-[0_10px_40px_rgba(220,38,38,0.3)]" style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)' }}>
              Crear mi cuenta gratis
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-12 px-6 z-10 bg-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/inkuro-logo.png" className="w-6 h-6 rounded" alt="Inkuro" />
            <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">© 2026 Inkuro. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-gray-600">
            <a href="#" className="hover:text-red-400 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-red-400 transition-colors">Términos</a>
            <a href="mailto:hola@inkuro.com" className="hover:text-red-400 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
