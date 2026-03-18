import React, { useEffect, useState, useCallback } from 'react';
import { getClientes, createCliente, updateCliente } from '../api';
import Modal from '../components/Modal';

const emptyForm = {
  nombre: '', apellidos: '', email: '', telefono: '',
  fecha_nacimiento: '', notas: '', sexo: '', instagram: '',
  conflictivo: false, flexible: false, habla_ingles: false,
  es_cliente_estudio: false, acepta_comunicaciones: true, acepta_redes: false,
  info_medica: '',
  tutor_legal_nombre: '', tutor_legal_dni: '', tutor_legal_telefono: '',
};

function Toggle({ label, checked, onChange, small }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div onClick={onChange}
        className={`relative rounded-full transition-colors flex-shrink-0 ${small ? 'w-8 h-4' : 'w-9 h-5'} ${checked ? 'bg-indigo-600' : 'bg-gray-600'}`}>
        <span className={`absolute top-0.5 bg-white rounded-full shadow transition-transform flex-shrink-0 ${small ? 'left-0.5 w-3 h-3' : 'left-0.5 w-4 h-4'} ${checked ? (small ? 'translate-x-4' : 'translate-x-4') : ''}`} />
      </div>
      <span className={`text-gray-300 ${small ? 'text-xs' : 'text-sm'}`}>{label}</span>
    </label>
  );
}

function SeccionHeader({ title }) {
  return <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider pt-2 pb-1 border-t border-gray-700">{title}</p>;
}

function esMenorDeEdad(fechaNac) {
  if (!fechaNac) return false;
  const hoy = new Date();
  const nac = new Date(fechaNac);
  const edad = hoy.getFullYear() - nac.getFullYear() - (hoy < new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate()) ? 1 : 0);
  return edad < 18;
}

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [filtroFlag, setFiltroFlag] = useState(''); // '' | 'conflictivo' | 'flexible'
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchClientes = useCallback(async (search) => {
    setLoading(true);
    try {
      const res = await getClientes(search || undefined);
      setClientes(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);
  useEffect(() => {
    const t = setTimeout(() => fetchClientes(buscar), 400);
    return () => clearTimeout(t);
  }, [buscar, fetchClientes]);

  const openNew = () => {
    setEditando(null);
    setForm(emptyForm);
    setError('');
    setModal(true);
  };

  const openEdit = (c) => {
    setEditando(c.id);
    setForm({
      nombre: c.nombre || '', apellidos: c.apellidos || '',
      email: c.email || '', telefono: c.telefono || '',
      fecha_nacimiento: c.fecha_nacimiento?.split('T')[0] || '',
      notas: c.notas || '', sexo: c.sexo || '', instagram: c.instagram || '',
      conflictivo: c.conflictivo || false, flexible: c.flexible || false,
      habla_ingles: c.habla_ingles || false, es_cliente_estudio: c.es_cliente_estudio || false,
      acepta_comunicaciones: c.acepta_comunicaciones ?? true,
      acepta_redes: c.acepta_redes || false,
      info_medica: c.info_medica || '',
      tutor_legal_nombre: c.tutor_legal_nombre || '',
      tutor_legal_dni: c.tutor_legal_dni || '',
      tutor_legal_telefono: c.tutor_legal_telefono || '',
    });
    setError('');
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editando) await updateCliente(editando, form);
      else await createCliente(form);
      setModal(false);
      fetchClientes(buscar);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const setF = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const clientesFiltrados = clientes.filter((c) => {
    if (filtroFlag === 'conflictivo') return c.conflictivo;
    if (filtroFlag === 'flexible') return c.flexible;
    return true;
  });

  const menorDeEdad = esMenorDeEdad(form.fecha_nacimiento);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clientes</h1>
        <button onClick={openNew}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo cliente
        </button>
      </div>

      {/* Búsqueda + filtros rápidos */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={buscar} onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por nombre, apellidos o email..."
            className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" />
        </div>
        <div className="flex gap-2">
          {[['', 'Todos'], ['conflictivo', '⚠ Conflictivos'], ['flexible', 'Flexibles']].map(([val, label]) => (
            <button key={val} onClick={() => setFiltroFlag(filtroFlag === val ? '' : val)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filtroFlag === val
                  ? val === 'conflictivo' ? 'bg-red-600 text-white' : val === 'flexible' ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Cargando...</div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            {buscar || filtroFlag ? 'No se encontraron resultados' : 'No hay clientes registrados'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Nombre</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 hidden md:table-cell">Teléfono</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 hidden lg:table-cell">No-shows</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((c) => (
                  <tr key={c.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-700/50 rounded-full flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                          {c.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-white text-sm font-medium">{c.nombre} {c.apellidos}</p>
                            {c.conflictivo && <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">⚠ Conflictivo</span>}
                            {c.flexible && <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Flexible</span>}
                            {c.habla_ingles && <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">EN</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell"><span className="text-gray-400 text-sm">{c.email || '—'}</span></td>
                    <td className="px-5 py-3 hidden md:table-cell"><span className="text-gray-400 text-sm">{c.telefono || '—'}</span></td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <span className={`text-sm font-medium ${Number(c.no_shows) >= 3 ? 'text-red-400' : 'text-gray-400'}`}>
                        {c.no_shows || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-white text-sm transition-colors">Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editando ? 'Editar cliente' : 'Nuevo cliente'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

          {/* Datos básicos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
              <input required value={form.nombre} onChange={(e) => setF('nombre', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Apellidos *</label>
              <input required value={form.apellidos} onChange={(e) => setF('apellidos', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setF('email', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Teléfono</label>
              <input value={form.telefono} onChange={(e) => setF('telefono', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notas</label>
            <textarea value={form.notas} onChange={(e) => setF('notas', e.target.value)} rows={2}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>

          {/* Datos personales */}
          <SeccionHeader title="Datos personales" />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">F. nacimiento</label>
              <input type="date" value={form.fecha_nacimiento} onChange={(e) => setF('fecha_nacimiento', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sexo</label>
              <select value={form.sexo} onChange={(e) => setF('sexo', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">—</option>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Instagram</label>
              <input value={form.instagram} onChange={(e) => setF('instagram', e.target.value)} placeholder="@usuario"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" />
            </div>
          </div>

          {/* Flags */}
          <SeccionHeader title="Flags" />
          <div className="grid grid-cols-2 gap-2">
            <Toggle small label="Conflictivo" checked={form.conflictivo} onChange={() => setF('conflictivo', !form.conflictivo)} />
            <Toggle small label="Flexible" checked={form.flexible} onChange={() => setF('flexible', !form.flexible)} />
            <Toggle small label="Habla inglés" checked={form.habla_ingles} onChange={() => setF('habla_ingles', !form.habla_ingles)} />
            <Toggle small label="Cliente del estudio" checked={form.es_cliente_estudio} onChange={() => setF('es_cliente_estudio', !form.es_cliente_estudio)} />
            <Toggle small label="Acepta comunicaciones" checked={form.acepta_comunicaciones} onChange={() => setF('acepta_comunicaciones', !form.acepta_comunicaciones)} />
            <Toggle small label="Acepta redes sociales" checked={form.acepta_redes} onChange={() => setF('acepta_redes', !form.acepta_redes)} />
          </div>

          {/* Info médica */}
          <SeccionHeader title="Información médica" />
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Info médica <span className="text-gray-600">(aparece en consentimientos)</span>
            </label>
            <textarea value={form.info_medica} onChange={(e) => setF('info_medica', e.target.value)} rows={2}
              placeholder="Alergias, medicamentos, enfermedades relevantes..."
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-gray-500" />
          </div>

          {/* Tutor legal — solo menores */}
          {menorDeEdad && (
            <>
              <SeccionHeader title="Tutor legal (menor de edad)" />
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Nombre del tutor</label>
                  <input value={form.tutor_legal_nombre} onChange={(e) => setF('tutor_legal_nombre', e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">DNI tutor</label>
                  <input value={form.tutor_legal_dni} onChange={(e) => setF('tutor_legal_dni', e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Teléfono tutor</label>
                  <input value={form.tutor_legal_telefono} onChange={(e) => setF('tutor_legal_telefono', e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
              {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
