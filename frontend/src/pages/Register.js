import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registroPublico } from '../api';
import { useAuth } from '../context/AuthContext';

const plans = [
  {
    id: 'basico',
    name: 'Starter',
    price: '29',
    desc: 'Para estudios pequeños que arrancan',
    features: ['Hasta 2 artistas', 'Calendario de citas', 'Gestión de clientes', 'Consentimientos digitales', 'Ficha de sesiones'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '59',
    desc: 'Para estudios en crecimiento',
    features: ['Artistas ilimitados', 'Todo lo del plan Starter', 'TPV y punto de venta', 'Contabilidad y liquidaciones', 'Estadísticas avanzadas', 'Sincronización de calendarios', 'Soporte prioritario'],
    popular: true,
  },
];

export default function Register() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [step, setStep] = useState(1); // 1: plan, 2: datos
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [form, setForm] = useState({ nombreEstudio: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Las contraseñas no coinciden.');
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    setLoading(true);
    try {
      const res = await registroPublico({ ...form, plan: selectedPlan });
      loginUser(res.data.token, res.data.usuario);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">InkFlow</span>
        </Link>
        <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
          ¿Ya tienes cuenta? <span className="text-indigo-400">Inicia sesión</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Steps indicator */}
        <div className="flex items-center gap-3 mb-10">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'}`}>1</div>
          <div className={`w-16 h-0.5 transition-colors ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-700'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'}`}>2</div>
          <span className="text-gray-500 text-sm ml-2">{step === 1 ? 'Elige tu plan' : 'Crea tu cuenta'}</span>
        </div>

        {step === 1 && (
          <div className="w-full max-w-3xl">
            <h1 className="text-3xl font-bold text-white text-center mb-2">Elige tu plan</h1>
            <p className="text-gray-400 text-center mb-8">14 días gratis, sin tarjeta de crédito. Cancela cuando quieras.</p>
            <div className="grid md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => { setSelectedPlan(plan.id); setStep(2); }}
                  className={`relative text-left p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] ${
                    selectedPlan === plan.id
                      ? 'border-indigo-500 bg-indigo-600/10'
                      : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">MÁS POPULAR</span>
                  )}
                  <div className="mb-4">
                    <div className="text-xl font-bold text-white">{plan.name}</div>
                    <div className="text-gray-400 text-sm mt-1">{plan.desc}</div>
                  </div>
                  <div className="text-4xl font-black text-white mb-1">
                    {plan.price}<span className="text-lg font-normal text-gray-400">€/mes</span>
                  </div>
                  <div className="text-xs text-indigo-400 mb-4">14 días gratis</div>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                        <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-center text-sm transition-colors">
                    Empezar con {plan.name} →
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full max-w-md">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Cambiar plan
            </button>
            <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
              <span className="text-white font-medium">Plan {plans.find(p => p.id === selectedPlan)?.name}</span>
              <span className="text-indigo-400 font-bold">{plans.find(p => p.id === selectedPlan)?.price}€/mes</span>
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-900 border border-white/5 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-white mb-2">Crea tu cuenta</h2>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Nombre del estudio</label>
                <input
                  type="text"
                  value={form.nombreEstudio}
                  onChange={e => setForm({ ...form, nombreEstudio: e.target.value })}
                  required
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                  placeholder="Ink & Bones Studio"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                  placeholder="hola@miestudio.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Confirmar contraseña</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-gray-500">
                Al registrarte aceptas nuestros{' '}
                <a href="#" className="text-indigo-400 hover:underline">Términos de Servicio</a>
                {' '}y{' '}
                <a href="#" className="text-indigo-400 hover:underline">Política de Privacidad</a>.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl py-3 text-sm transition-colors mt-2"
              >
                {loading ? 'Creando tu estudio...' : 'Empezar 14 días gratis →'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
