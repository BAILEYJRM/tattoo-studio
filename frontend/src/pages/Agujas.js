import React, { useState, useEffect, useCallback } from 'react';
import { getAgujas, getAgujasCaducidad, createAguja, updateAguja, deleteAguja } from '../api';
import Modal from '../components/Modal';

const TIPOS_AGUJA = ['Round Liner','Round Shader','Magnum','Curved Magnum','Flat','Bugpin','Cartridge','Otro'];

const emptyForm = {
  marca: '', modelo: '', tipo: '', numero_lote: '',
  fecha_caducidad: '', fecha_fabricacion: '',
};

function caducidadBadge(fecha) {
  if (!fecha) return <span className="text-gray-600 text-xs">—</span>;
  const hoy = new Date();
  const cad = new Date(fecha + 'T00:00:00');
  const dias = Math.ceil((cad - hoy) / (1000 * 60 * 60 * 24));
  if (dias < 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Caducada</span>;
  if (dias <= 30) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">&lt;30d</span>;
  if (dias <= 90) return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">&lt;90d</span>;
  return <span className="text-gray-500 text-xs">{new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function Agujas() {
  const [agujas, setAgujas] = useState([]);
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
      const [aRes, cadRes] = await Promise.all([
        getAgujas(params),
        getAgujasCaducidad(30),
      ]);
      setAgujas(aRes.data);
      setProxCaducidad(cadRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [buscar, filtroMarca]);

  useEffect(() => { cargar(); }, [cargar]);

  const marcas = [...new Set(agujas.map((a) => a.marca).filter(Boolean))].sort();

  const openNew = () => { setEditando(null); setForm(emptyForm); setModal(true); };
  const openEdit = (a) => {
    setEditando(a.id);
    setForm({
      marca: a.marca || '', modelo: a.modelo || '', tipo: a.tipo || '',
      numero_lote: a.numero_lote || '',
      fecha_caducidad: a.fecha_caducidad?.split('T')[0] || '',
      fecha_fabricacion: a.fecha_fabricacion?.split('T')[0] || '',
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        fecha_caducidad: form.fecha_caducidad || null,
        fecha_fabricacion: form.fecha_fabricacion || null,
      };
      if (editando) await updateAguja(editando, payload);
      else await createAguja(payload);
      setModal(false);
      cargar();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDesactivar = async (id) => {
    if (!window.confirm('¿Desactivar esta aguja?')) return;
    try { await deleteAguja(id); cargar(); }
    catch (e) { console.error(e); }
  };

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agujas</h1>
          <p className="text-gray-400 text-sm mt-0.5">Control de agujas y cartuchos estériles</p>
        </div>
        <button onClick={openNew}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva aguja
        </button>
      </div>

      {/* Alerta caducidad */}
      {proxCaducidad.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div>
            <p className="text-red-400 text-sm font-medium">{proxCaducidad.length} aguja(s) caducan en menos de 30 días</p>
            <p className="text-red-400/70 text-xs">{proxCaducidad.map((a) => `${a.marca} ${a.modelo}`).join(', ')}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Buscar por marca, modelo o tipo..."
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
        ) : agujas.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No hay agujas registradas</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Marca','Modelo','Tipo','Lote','Caducidad','Fabricación',''].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agujas.map((a) => (
                  <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2.5 text-white font-medium">{a.marca || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-300">{a.modelo || '—'}</td>
                    <td className="px-4 py-2.5">
                      {a.tipo && <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{a.tipo}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{a.numero_lote || '—'}</td>
                    <td className="px-4 py-2.5">{caducidadBadge(a.fecha_caducidad?.split('T')[0])}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{fmtDate(a.fecha_fabricacion?.split('T')[0])}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3 justify-end">
                        <button onClick={() => openEdit(a)} className="text-gray-400 hover:text-white text-xs transition-colors">Editar</button>
                        <button onClick={() => handleDesactivar(a.id)} className="text-gray-400 hover:text-red-400 text-xs transition-colors">Desactivar</button>
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
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editando ? 'Editar aguja' : 'Nueva aguja'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Marca</label>
              <input value={form.marca} onChange={(e) => setF('marca', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Modelo</label>
              <input value={form.modelo} onChange={(e) => setF('modelo', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Tipo</label>
              <select value={form.tipo} onChange={(e) => setF('tipo', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Seleccionar tipo</option>
                {TIPOS_AGUJA.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nº Lote</label>
              <input value={form.numero_lote} onChange={(e) => setF('numero_lote', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Fecha fabricación</label>
              <input type="date" value={form.fecha_fabricacion} onChange={(e) => setF('fecha_fabricacion', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Fecha caducidad</label>
              <input type="date" value={form.fecha_caducidad} onChange={(e) => setF('fecha_caducidad', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
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
