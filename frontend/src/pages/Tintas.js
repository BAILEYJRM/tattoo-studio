import React, { useState, useEffect, useCallback } from 'react';
import { getTintas, getTintasCaducidad, createTinta, updateTinta, deleteTinta } from '../api';
import Modal from '../components/Modal';

const emptyForm = {
  nombre: '', marca: '', color: '#000000', codigo: '',
  numero_lote: '', fecha_caducidad: '', homologada: true,
};

function caducidadBadge(fecha) {
  if (!fecha) return null;
  const hoy = new Date();
  const cad = new Date(fecha + 'T00:00:00');
  const dias = Math.ceil((cad - hoy) / (1000 * 60 * 60 * 24));
  if (dias < 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Caducada</span>;
  if (dias <= 30) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">&lt;30d</span>;
  if (dias <= 90) return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">&lt;90d</span>;
  return <span className="text-gray-500 text-xs">{new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>;
}

export default function Tintas() {
  const [tintas, setTintas] = useState([]);
  const [proxCaducidad, setProxCaducidad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (buscar) params.buscar = buscar;
      if (filtroMarca) params.marca = filtroMarca;
      const [tRes, cadRes] = await Promise.all([
        getTintas(params),
        getTintasCaducidad(30),
      ]);
      setTintas(tRes.data);
      setProxCaducidad(cadRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [buscar, filtroMarca]);

  useEffect(() => { cargar(); }, [cargar]);

  const marcas = [...new Set(tintas.map((t) => t.marca).filter(Boolean))].sort();

  const openNew = () => { setEditando(null); setForm(emptyForm); setModal(true); };
  const openEdit = (t) => {
    setEditando(t.id);
    setForm({
      nombre: t.nombre || '', marca: t.marca || '', color: t.color || '#000000',
      codigo: t.codigo || '', numero_lote: t.numero_lote || '',
      fecha_caducidad: t.fecha_caducidad?.split('T')[0] || '',
      homologada: t.homologada !== false,
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, fecha_caducidad: form.fecha_caducidad || null };
      if (editando) await updateTinta(editando, payload);
      else await createTinta(payload);
      setModal(false);
      cargar();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDesactivar = async (id) => {
    if (!window.confirm('¿Desactivar esta tinta?')) return;
    try { await deleteTinta(id); cargar(); }
    catch (e) { console.error(e); }
  };

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tintas</h1>
          <p className="text-gray-400 text-sm mt-0.5">Registro y control de tintas homologadas</p>
        </div>
        <button onClick={openNew}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva tinta
        </button>
      </div>

      {/* Alerta caducidad */}
      {proxCaducidad.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div>
            <p className="text-red-400 text-sm font-medium">{proxCaducidad.length} tinta(s) caducan en menos de 30 días</p>
            <p className="text-red-400/70 text-xs">{proxCaducidad.map((t) => t.nombre).join(', ')}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Buscar por nombre, marca o código..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="flex-1 min-w-[200px] bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
        />
        <select value={filtroMarca} onChange={(e) => setFiltroMarca(e.target.value)}
          className="bg-gray-900 text-gray-300 text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Todas las marcas</option>
          {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Cargando...</div>
        ) : tintas.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No hay tintas registradas</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Color','Nombre','Marca','Código','Lote','Caducidad','Homologada',''].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tintas.map((t) => (
                  <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2.5">
                      <div className="w-6 h-6 rounded-full border border-gray-700 flex-shrink-0"
                        style={{ backgroundColor: t.color || '#000' }} />
                    </td>
                    <td className="px-4 py-2.5 text-white font-medium">{t.nombre}</td>
                    <td className="px-4 py-2.5 text-gray-400">{t.marca || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{t.codigo || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{t.numero_lote || '—'}</td>
                    <td className="px-4 py-2.5">{caducidadBadge(t.fecha_caducidad?.split('T')[0])}</td>
                    <td className="px-4 py-2.5">
                      {t.homologada
                        ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">✓ Homologada</span>
                        : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-500">No</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3 justify-end">
                        <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-white text-xs transition-colors">Editar</button>
                        <button onClick={() => handleDesactivar(t.id)} className="text-gray-400 hover:text-red-400 text-xs transition-colors">Desactivar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editando ? 'Editar tinta' : 'Nueva tinta'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
              <input required value={form.nombre} onChange={(e) => setF('nombre', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Marca</label>
              <input value={form.marca} onChange={(e) => setF('marca', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Código</label>
              <input value={form.codigo} onChange={(e) => setF('codigo', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color} onChange={(e) => setF('color', e.target.value)}
                  className="w-10 h-9 bg-gray-700 rounded-lg cursor-pointer border-0 p-0.5 flex-shrink-0" />
                <input value={form.color} onChange={(e) => setF('color', e.target.value)}
                  placeholder="#000000"
                  className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nº Lote</label>
              <input value={form.numero_lote} onChange={(e) => setF('numero_lote', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Fecha caducidad</label>
              <input type="date" value={form.fecha_caducidad} onChange={(e) => setF('fecha_caducidad', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setF('homologada', !form.homologada)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${form.homologada ? 'bg-indigo-600' : 'bg-gray-600'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.homologada ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-sm text-gray-300">Tinta homologada (REACH/EU)</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">Cancelar</button>
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
