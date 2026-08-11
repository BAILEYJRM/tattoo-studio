import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, FileSignature, CreditCard, BarChart3, Package, ArrowRight, Check, Clock, DollarSign, BarChart2, Sparkles, Eye, Cookie, CheckCircle, FileText, HelpCircle, MapPin, Phone, Mail, ChevronLeft, ChevronRight, Briefcase, FileCheck, Zap, MessageSquare, X, Shield, Globe, Monitor, Send, Smartphone, Calendar, Layers } from 'lucide-react';

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
    const N = 85;

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
        this.color = c > 0.8 ? '#ef4444' : c > 0.4 ? '#b91c1c' : '#374151';
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
      const g = ctx.createRadialGradient(mouse.current.x, mouse.current.y, 0, mouse.current.x, mouse.current.y, 250);
      g.addColorStop(0, 'rgba(220,38,38,0.08)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
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
    gradient: 'from-[#7f1d1d]/80 to-[#450a0a]/80',
    shadow: 'rgba(220, 38, 38, 0.2)',
    borderColor: 'border-red-900/40',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    icon: <CalendarDays className="w-6 h-6" />,
    title: 'Calendario & iCal Feed',
    desc: 'Vista por artista y cabina. Sincronización en vivo con Google Calendar, iPhone, Mac y Goldie.',
  },
  {
    gradient: 'from-[#1e3a8a]/80 to-[#172554]/80',
    shadow: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'border-blue-900/40',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    icon: <Users className="w-6 h-6" />,
    title: 'Clientes & Ficha Completa',
    desc: 'Histórico de sesiones, fotos de tatuajes, tutores legales para menores y alertas de alergias.',
  },
  {
    gradient: 'from-[#78350f]/80 to-[#451a03]/80',
    shadow: 'rgba(217, 119, 6, 0.2)',
    borderColor: 'border-amber-900/40',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    icon: <FileSignature className="w-6 h-6" />,
    title: 'Consentimientos Seguros',
    desc: 'Firma digital en tablet o enlace público. PDF automático con registro de lotes de tintas y agujas.',
  },
  {
    gradient: 'from-[#9a3412]/80 to-[#431407]/80',
    shadow: 'rgba(234, 88, 12, 0.2)',
    borderColor: 'border-orange-900/40',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-400',
    icon: <CreditCard className="w-6 h-6" />,
    title: 'TPV & Alquiler de Cabinas',
    desc: 'Cobro de sesiones, mercancía y gestión de contratos Booth Rental (alquiler de silla 1099/autónomos).',
  },
  {
    gradient: 'from-[#701a75]/80 to-[#4a044e]/80',
    shadow: 'rgba(192, 38, 211, 0.2)',
    borderColor: 'border-fuchsia-900/40',
    iconBg: 'bg-fuchsia-500/10',
    iconColor: 'text-fuchsia-400',
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Liquidación de Artistas',
    desc: 'Cálculo automático de porcentaje/comisión por artista y recaudación neta del estudio.',
  },
  {
    gradient: 'from-[#3f3f46]/80 to-[#18181b]/80',
    shadow: 'rgba(161, 161, 170, 0.2)',
    borderColor: 'border-zinc-800/40',
    iconBg: 'bg-zinc-500/10',
    iconColor: 'text-zinc-400',
    icon: <Package className="w-6 h-6" />,
    title: 'Inventario & Materiales',
    desc: 'Control estricto de tintas homologadas, cartuchos y grips con avisos de stock mínimo.',
  },
  {
    gradient: 'from-[#1e1b4b]/80 to-[#312e81]/80',
    shadow: 'rgba(99, 102, 241, 0.2)',
    borderColor: 'border-indigo-900/40',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-400',
    icon: <Briefcase className="w-6 h-6" />,
    title: 'CRM & Pipeline Kanban',
    desc: 'Captura solicitudes de clientes, clasifica leads por estado y mide el ratio de conversión comercial.',
  },
  {
    gradient: 'from-[#065f46]/80 to-[#064e3b]/80',
    shadow: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'border-emerald-900/40',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    icon: <FileCheck className="w-6 h-6" />,
    title: 'Presupuestos Interactivos',
    desc: 'Envía propuestas digitales con enlace público por WhatsApp o Email para que el cliente acepte con un clic.',
  },
];

const plans = [
  { id: 'mensual', name: 'KuroIchi PRO Mensual', price: '50€', period: 'mes', desc: 'Para empezar sin compromiso. Paga mes a mes y cancela cuando quieras.', popular: false },
  { id: 'semestral', name: 'KuroIchi PRO Semestral', price: '250€', period: 'semestre', desc: 'Más barato que el mensual. Ideal para estudios consolidados (Ahorras 50€).', popular: false },
  { id: 'anual', name: 'KuroIchi PRO Anual', price: '450€', period: 'año', desc: 'El mejor precio. Ahorra al máximo y despreocúpate todo el año (Ahorras 150€).', popular: true },
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [showFullFeatures, setShowFullFeatures] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactForm, setContactForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '', antispam: '' });
  const scrollRef = useRef(null);

  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  useEffect(() => { const f = () => setScrolled(window.scrollY > 20); window.addEventListener('scroll', f); return () => window.removeEventListener('scroll', f); }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactForm.antispam.trim() !== '7') {
      alert('La respuesta a la pregunta antispam no es correcta (3 + 4 = 7)');
      return;
    }
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactForm({ nombre: '', email: '', telefono: '', mensaje: '', antispam: '' });
    }, 4000);
  };

  return (
    <div className="min-h-screen text-gray-200" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#050505' }}>
      <ReactiveBackground />

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md shadow-2xl' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-2xl tracking-tighter text-white uppercase" style={{ letterSpacing: '-0.05em' }}>KuroIchi</span>
            <span className="bg-red-950/60 text-red-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">Pro Studio</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-bold tracking-wide text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">HERRAMIENTAS</a>
            <a href="#capacidad" className="hover:text-white transition-colors">VISTA SOFTWARE</a>
            <a href="#pricing" className="hover:text-white transition-colors">PRECIOS</a>
            <a href="#contacto" className="hover:text-white transition-colors">CONTACTO</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold tracking-wider text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all uppercase">Acceder</Link>
            <Link to="/registro" className="text-sm font-black text-white px-5 py-2 rounded-lg transition-all hover:scale-105 uppercase tracking-wider shadow-[0_4px_16px_rgba(220,38,38,0.25)]" style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)' }}>Pruébalo Gratis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-16 px-6 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-8 shadow-sm" style={{ background: 'rgba(220,38,38,0.1)', color: '#fca5a5' }}>
            <Zap className="w-4 h-4 text-red-400 animate-pulse" />
            Software de Gestión para Estudios de Tatuaje & Piercing
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 uppercase tracking-tighter text-white" style={{ letterSpacing: '-0.03em' }}>
            Gobierna tu estudio,<br />
            <span className="bg-gradient-to-r from-red-500 via-red-600 to-amber-400 bg-clip-text text-transparent">
              domina el arte de la tinta
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Gestión completa de citas, agenda iCal, consentimientos informados con Firma Digital en Tablet, TPV, CRM Kanban y alquiler de cabinas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/registro" className="flex items-center gap-3 text-white font-black px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 uppercase tracking-wide shadow-[0_8px_30px_rgba(220,38,38,0.4)]" style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)' }}>
              Prueba KuroIchi PRO 14 Días Gratis
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {/* Marquee de Estudios */}
        <div className="w-full py-4 overflow-hidden my-6">
          <div className="max-w-7xl mx-auto flex items-center gap-4 px-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-red-400 tracking-wider flex-shrink-0 bg-red-950/40 px-3 py-1.5 rounded-lg">
              <Zap className="w-4 h-4" /> Ya confían en KuroIchi:
            </div>
            <div className="overflow-hidden whitespace-nowrap flex-1">
              <div className="inline-block animate-marquee text-xs font-bold text-gray-400 tracking-wider">
                958 Tattoo Studio · Tracia Tattoo Studio · Estudio El Salado · Arte y Tinta · Hall Kids Tattoo · Aracne Tattoo BCN · La Galería Negra · Uffizi Studio · Purezas Tattoo · Moe Tattoo · La Tinta que Habito · Targaryen Tattoo · Sajo Tattoo · La Mujer Barbuda · Seventh Heaven Tattoo · Asimetric Gallery · Cookin Tattoo · Etther Museum · Bilbao Tattoo Addicts · Konoha Tattoo · Black Haru · The Bonfire Tattoo · Jaula Studio · Volt Tattoo · Piva Tattoo · Larga Vida Tattoo · InkBro Community · Piedrabuena Tattoo · 13 Calaveras Tattoo · 
              </div>
            </div>
          </div>
          <style>{`
            @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
            .animate-marquee { display: inline-block; animation: marquee 35s linear infinite; }
          `}</style>
        </div>

        {/* Mockup 1: Panel Principal de KuroIchi */}
        <div className="max-w-5xl mx-auto mt-12 relative hidden md:block">
          <div className="relative rounded-2xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.9)] bg-[#0d0d0d]">
            <div className="flex items-center justify-between px-4 py-3 bg-black/80">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600"/><div className="w-3 h-3 rounded-full bg-yellow-600"/><div className="w-3 h-3 rounded-full bg-green-600"/>
                <div className="ml-4 bg-gray-900 rounded px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-gray-400">app.kuroichi.com/dashboard</div>
              </div>
              <div className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/> Sincronizado iCal & TPV
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-900/90 rounded-xl p-4 shadow-md">
                  <div className="text-xs uppercase text-gray-500 font-bold">Citas de Hoy</div>
                  <div className="text-2xl font-black text-red-400 mt-1">14 Citas</div>
                  <div className="text-[10px] text-gray-500 mt-1">3 Artistas en cabina</div>
                </div>
                <div className="bg-gray-900/90 rounded-xl p-4 shadow-md">
                  <div className="text-xs uppercase text-gray-500 font-bold">Caja del Día</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">2.450 €</div>
                  <div className="text-[10px] text-emerald-400 mt-1">TPV & Depósitos</div>
                </div>
                <div className="bg-gray-900/90 rounded-xl p-4 shadow-md">
                  <div className="text-xs uppercase text-gray-500 font-bold">Consentimientos PDF</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">14 Firmados</div>
                  <div className="text-[10px] text-gray-500 mt-1">Con lote de tintas</div>
                </div>
                <div className="bg-gray-900/90 rounded-xl p-4 shadow-md">
                  <div className="text-xs uppercase text-gray-500 font-bold">Booth Rental</div>
                  <div className="text-2xl font-black text-indigo-400 mt-1">4 Cabinas</div>
                  <div className="text-[10px] text-indigo-300 mt-1">Alquileres al día</div>
                </div>
              </div>

              {/* Calendario Mockup */}
              <div className="bg-gray-900/90 rounded-xl p-5 shadow-md space-y-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-400">
                  <span>Agenda Semanal de Cabinas & Tatuadores</span>
                  <span className="text-amber-400">Modo Multi-Región (EE.UU. / España)</span>
                </div>
                <div className="grid grid-cols-5 gap-3 h-28">
                  <div className="bg-black/60 rounded-lg p-2.5 space-y-1">
                    <div className="text-[10px] font-bold text-gray-400">Cabina 1 — Alex (Realismo)</div>
                    <div className="bg-red-950/60 border border-red-500/40 text-red-300 text-[10px] p-1.5 rounded font-bold">10:00h · Espalda Completa (500€)</div>
                  </div>
                  <div className="bg-black/60 rounded-lg p-2.5 space-y-1">
                    <div className="text-[10px] font-bold text-gray-400">Cabina 2 — Sarah (Fine Line)</div>
                    <div className="bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] p-1.5 rounded font-bold">12:30h · Micro-realismo (220€)</div>
                  </div>
                  <div className="bg-black/60 rounded-lg p-2.5 space-y-1">
                    <div className="text-[10px] font-bold text-gray-400">Cabina 3 — Guest Artist</div>
                    <div className="bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-[10px] p-1.5 rounded font-bold">15:00h · Booth Rental (Fee)</div>
                  </div>
                  <div className="bg-black/60 rounded-lg p-2.5 space-y-1">
                    <div className="text-[10px] font-bold text-gray-400">Cabina 4 — Piercing Area</div>
                    <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] p-1.5 rounded font-bold">17:00h · Septum + Titano (65€)</div>
                  </div>
                  <div className="bg-black/60 rounded-lg p-2.5 space-y-1">
                    <div className="text-[10px] font-bold text-gray-400">Tablet Tablet PIN Mode</div>
                    <div className="bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[10px] p-1.5 rounded font-bold">Acceso Rápido Artista</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative py-20 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-white uppercase tracking-tight">Todo lo que necesita tu estudio</h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto font-medium">Herramientas creadas específicamente para la gestión diaria de tatuadores y managers</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className={`group relative rounded-2xl p-8 border ${f.borderColor} transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-gradient-to-br ${f.gradient}`}>
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

      {/* VISTA DEL SOFTWARE — MOCKUPS DE CRM KANBAN & CONSENTIMIENTOS */}
      <section id="capacidad" className="relative py-20 px-6 z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tight text-white">Diseñado para la Acción Diaria</h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto font-medium">
              Echa un vistazo a la interfaz real de KuroIchi: veloz, oscura e intuitiva.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mockup CRM Kanban */}
            <div className="bg-gray-900/90 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-black text-white uppercase">
                  <Briefcase className="w-5 h-5 text-indigo-400" /> Pipeline CRM Kanban (Leads)
                </div>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded font-bold uppercase">Comercial</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/50 p-2.5 rounded-xl space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">1. Solicitud Nueva</div>
                  <div className="bg-gray-800 p-2 rounded-lg text-xs font-bold text-white">
                    <div>Carlos M.</div>
                    <div className="text-[10px] text-gray-400 font-normal">Manga Blackwork</div>
                  </div>
                </div>
                <div className="bg-black/50 p-2.5 rounded-xl space-y-2">
                  <div className="text-[10px] font-bold text-amber-400 uppercase">2. Presupuesto Enviado</div>
                  <div className="bg-amber-950/40 border border-amber-500/30 p-2 rounded-lg text-xs font-bold text-amber-200">
                    <div>Elena R.</div>
                    <div className="text-[10px] text-amber-400/80 font-normal">Link WhatsApp Activo</div>
                  </div>
                </div>
                <div className="bg-black/50 p-2.5 rounded-xl space-y-2">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase">3. Cita Reservada</div>
                  <div className="bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-lg text-xs font-bold text-emerald-200">
                    <div>David P.</div>
                    <div className="text-[10px] text-emerald-400/80 font-normal">Señal de 100€ Recibida</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup Consentimiento Digital & PDF */}
            <div className="bg-gray-900/90 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-black text-white uppercase">
                  <FileSignature className="w-5 h-5 text-amber-400" /> Firma Digital en Tablet (Consentimientos)
                </div>
                <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-bold uppercase">Validez Legal</span>
              </div>
              <div className="bg-black/50 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs text-gray-300 font-bold">
                  <span>Consentimiento Informado de Tatuaje</span>
                  <span className="text-emerald-400">PDF Generado</span>
                </div>
                <div className="p-3 bg-gray-800/80 rounded-lg text-[11px] font-mono text-gray-300 space-y-1">
                  <div>• Cliente: María Fernández (DNI: 489210XX)</div>
                  <div>• Lote Tinta: Intenze Black #L-9982 (Homologada)</div>
                  <div>• Agujas: Cartucho 3RL Kwadron #KW-441</div>
                  <div className="text-amber-400 pt-1">• Firma Cliente: [Firma Digital Verificada ✓]</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qué incluye Carrusel + Botón Modal Completo */}
      <section className="relative py-20 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter text-white">¿Qué incluye KuroIchi?</h2>
              <p className="text-lg text-gray-400 font-medium">
                Todo el ecosistema de gestión para estudios profesionales sin cuotas ocultas.
              </p>
            </div>
            <div className="flex gap-3 mt-6 md:mt-0">
              <button onClick={() => scroll(-400)} className="w-12 h-12 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-white hover:bg-gray-800 hover:border-red-500 transition-colors shadow-lg">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={() => scroll(400)} className="w-12 h-12 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-white hover:bg-gray-800 hover:border-red-500 transition-colors shadow-lg">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="overflow-x-auto pb-4 hide-scrollbar scroll-smooth">
            <div className="grid grid-rows-2 grid-flow-col gap-4 min-w-max px-4">
              {[
                "Sincronización iCal / ICS Feed en vivo con Google Calendar y Mac",
                "Acceso rápido por PIN de 4-6 dígitos para tablets/iPads de estudio",
                "Perfil reducidos para Artistas (operativo) vs Perfil Manager",
                "Modo Multi-Región (Adaptado para España 🇪🇸 y EE.UU. 🇺🇸)",
                "Contratos y gestión de Booth Rental (alquiler de silla)",
                "Fichas de clientes con tutores legales y consentimientos",
                "Consentimientos informados digitales firmables en tablet o enlace",
                "Registro de lotes de tintas y agujas homologadas en PDF",
                "Pipeline Kanban CRM para control comercial de leads",
                "Presupuestos interactivos enviables por WhatsApp",
                "Cálculo automático de comisiones y liquidación por artista",
                "Caja diaria, TPV y recuento de ventas de productos/piercing",
                "Idiomas intercambiables en tiempo real (Español / English)",
                "Control de inventario con avisos de stock crítico",
                "Exportación de datos de contabilidad para tu gestor fiscal",
                "Soporte técnico prioritario y actualizaciones sin coste adicional"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-900/90 border border-gray-800 rounded-xl p-5 w-80 hover:bg-gray-800/80 transition-colors shrink-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-red-500/20 text-red-500">
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </div>
                  <span className="text-gray-300 font-medium text-sm leading-tight">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => setShowFullFeatures(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-red-950/40 border border-red-600/50 text-red-300 hover:text-white hover:bg-red-900/60 rounded-xl font-bold uppercase text-xs tracking-wider transition-all shadow-lg"
            >
              <FileCheck className="w-4 h-4" /> Ver la matriz completa de características de KuroIchi
            </button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-20 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter text-white">Planes y Precios</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg font-medium">
              Prueba KuroIchi PRO gratis durante 14 días. Sin tarjetas de crédito ni compromisos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-10">
            {plans.map((plan) => (
              <div key={plan.id} className={`relative rounded-3xl p-8 border transition-all hover:-translate-y-2 flex flex-col justify-between ${plan.popular ? 'border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.2)] bg-[#120808]' : 'border-gray-800 bg-gray-900/90 hover:border-gray-700'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full" style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)' }}>
                    Mejor Valor
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 text-red-500 mb-2">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{plan.name}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-6 font-medium">{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-gray-500 font-bold uppercase text-xs">/{plan.period}</span>
                  </div>
                </div>

                <div>
                  <Link
                    to="/registro"
                    className={`block text-center font-black uppercase tracking-wider py-3.5 rounded-xl text-xs transition-all ${plan.popular ? 'text-white shadow-lg hover:scale-105' : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'}`}
                    style={plan.popular ? { background: 'linear-gradient(135deg,#dc2626,#991b1b)' } : {}}
                  >
                    Empezar gratis
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 text-center max-w-3xl mx-auto">
            <p className="text-sm font-bold text-gray-300 uppercase tracking-wide">
              Todos los precios <span className="text-red-400">INCLUYEN IMPUESTOS</span> || Ningún plan tiene cuota de alta, baja ni permanencia.
            </p>
          </div>
        </div>
      </section>

      {/* Sección Contacto & WhatsApp */}
      <section id="contacto" className="relative py-20 px-6 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter text-white">¿Tienes dudas? Te escuchamos</h2>
            <p className="text-gray-400 text-lg font-medium">Contáctanos directamente y te ayudaremos a dejar listo tu estudio.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Formulario */}
            <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-500" /> Escríbenos un mensaje
              </h3>
              {contactSent ? (
                <div className="p-6 bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 rounded-2xl text-center font-bold text-sm">
                  ¡Mensaje enviado con éxito! Te responderemos muy pronto.
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Nombre *</label>
                    <input required type="text" value={contactForm.nombre} onChange={e => setContactForm({ ...contactForm, nombre: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Email *</label>
                    <input required type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Teléfono</label>
                    <input type="tel" value={contactForm.telefono} onChange={e => setContactForm({ ...contactForm, telefono: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Mensaje *</label>
                    <textarea required rows={3} value={contactForm.mensaje} onChange={e => setContactForm({ ...contactForm, mensaje: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-400 mb-1">¿Cuánto es 3 + 4? (Antispam) *</label>
                    <input required type="text" value={contactForm.antispam} onChange={e => setContactForm({ ...contactForm, antispam: e.target.value })} placeholder="Escribe el resultado numérico"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500" />
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg">
                    Enviar mensaje
                  </button>
                </form>
              )}
            </div>

            {/* WhatsApp Box */}
            <div className="flex flex-col justify-between gap-6">
              <div className="bg-gray-900/90 border border-emerald-900/40 rounded-3xl p-8 text-center flex-1 flex flex-col justify-center items-center">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mb-4">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 uppercase">¿Prefieres hablar por WhatsApp?</h3>
                <p className="text-gray-400 text-xs mb-6 max-w-sm">Escríbenos directamente por WhatsApp y resolveremos todas las dudas sobre tu estudio en el acto.</p>
                <a
                  href="https://wa.me/34611156933"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg hover:scale-105"
                >
                  <MessageSquare className="w-5 h-5" /> Hablar por WhatsApp
                </a>
              </div>

              <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-6 text-center">
                <h4 className="text-sm font-bold text-white mb-2 uppercase">Prueba a tu ritmo</h4>
                <p className="text-gray-400 text-xs mb-4">Empieza hoy tus 14 días gratis sin tarjetas ni permanencias.</p>
                <Link to="/registro" className="inline-block px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase text-xs tracking-wider rounded-xl transition-colors">
                  Crear mi estudio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de características completas */}
      {showFullFeatures && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
            <button
              onClick={() => setShowFullFeatures(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white bg-gray-800 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Todo lo que incluye KuroIchi PRO</h3>
            <p className="text-gray-400 text-sm mb-8">Matriz de funcionalidades avanzadas diseñadas para managers y tatuadores.</p>

            <div className="grid md:grid-cols-3 gap-8 text-left text-xs">
              <div className="space-y-3">
                <h4 className="font-bold text-red-400 uppercase tracking-wider text-sm border-b border-red-900/50 pb-2">1. Gestión, Roles & Multi-Región</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Multi-Región (Modo España 🇪🇸 & EE.UU. 🇺🇸)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Permisos por Rol (Manager vs Artista)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> PIN de Acceso de 4-6 dígitos para Tablet</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Calendario por Artista y por Cabina</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sincronización iCal / ICS Feed en vivo</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Asignación de sillas y solapes inteligentes</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-red-400 uppercase tracking-wider text-sm border-b border-red-900/50 pb-2">2. CRM, Legal & Presupuestos</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Pipeline Kanban CRM para captación de leads</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Consentimientos firmables digitalmente</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Lotes de tintas y agujas registradas en PDF</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Control de menores con firma de tutor legal</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Presupuestos interactivos enviables vía WhatsApp</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Traducciones multi-idioma (ES / EN)</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-red-400 uppercase tracking-wider text-sm border-b border-red-900/50 pb-2">3. Finanzas, TPV & Booth Rental</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Punto de Venta TPV para sesiones y merchan</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Módulo de Booth Rental (Alquiler de Silla)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Liquidaciones porcentuales por artista</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Recuento diario de caja y arqueo</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Control de inventario y stock mínimo</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Exportación limpia para tu asesoría fiscal</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="pt-16 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-sm text-gray-300">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="mb-6">
                <span className="font-black text-3xl tracking-tighter text-white uppercase" style={{ letterSpacing: '-0.05em' }}>KuroIchi</span>
                <p className="mt-2 text-gray-400 font-medium text-sm">El sistema definitivo de gestión para estudios de tatuaje y piercing.</p>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Enlaces de Interés</h4>
              <ul className="space-y-4 font-medium text-gray-400">
                <li><Link to="/legal/privacidad" className="flex items-center gap-3 hover:text-white transition-colors"><Eye className="w-4 h-4 text-red-500" /> Política de Privacidad</Link></li>
                <li><Link to="/legal/cookies" className="flex items-center gap-3 hover:text-white transition-colors"><Cookie className="w-4 h-4 text-red-500" /> Política de Cookies</Link></li>
                <li><Link to="/legal/terminos" className="flex items-center gap-3 hover:text-white transition-colors"><CheckCircle className="w-4 h-4 text-red-500" /> Condiciones Generales</Link></li>
                <li><Link to="/faq" className="flex items-center gap-3 hover:text-white transition-colors"><HelpCircle className="w-4 h-4 text-red-500" /> FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Contacto</h4>
              <ul className="space-y-4 font-medium text-gray-400">
                <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-red-500 shrink-0" /> (+34) 611 15 69 33</li>
                <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-red-500 shrink-0" /> blackbloodartstudio@gmail.com</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
