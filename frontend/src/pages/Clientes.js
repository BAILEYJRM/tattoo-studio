import React, { useEffect, useState, useCallback } from 'react';
import { getClientes, createCliente, updateCliente } from '../api';
import Modal from '../components/Modal';

const emptyForm = {
  nombre: '',
  apellidos: '',
  email: '',
  telefono: '',
  fecha_nacimiento: '',
  notas: '',
};

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  useEffect(() => {
    const timer = setTimeout(() => fetchClientes(buscar), 400);
    return () => clearTimeout(timer);
  }, [buscar, fetchClientes]);

  const openNew = () => {
    setEditando(null);
    setForm(emptyForm);
    setError('');
    setModal(true);
  };

  const openEdit = (cliente) => {
    setEditando(cliente.id);
    setForm({
      nombre: cliente.nombre || '',
      apellidos: cliente.apellidos || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      fecha_nacimiento: cliente.fecha_nacimiento?.split('T')[0] || '',
      notas: cliente.notas || '',
    });
    setError('');
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editando) {
        await updateCliente(editando, form);
      } else {
        await createCliente(form);
      }
      setModal(false);
      fetchClientes(buscar);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, name, type = 'text', extra = {}) => (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
        {...extra}
      />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clientes</h1>
        <button
          onClick={openNew}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar por nombre, apellidos o email..."
          className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Cargando...</div>
        ) : clientes.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            {buscar ? 'No se encontraron resultados' : 'No hay clientes registrados'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Nombre</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 hidden md:table-cell">Teléfono</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 hidden lg:table-cell">Registro</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-700/50 rounded-full flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                          {c.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{c.nombre} {c.apellidos}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className="text-gray-400 text-sm">{c.email || '—'}</span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-gray-400 text-sm">{c.telefono || '—'}</span>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <span className="text-gray-400 text-sm">
                        {new Date(c.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editando ? 'Editar cliente' : 'Nuevo cliente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {field('Nombre *', 'nombre', 'text', { required: true })}
            {field('Apellidos *', 'apellidos', 'text', { required: true })}
          </div>
          {field('Email', 'email', 'email')}
          {field('Teléfono', 'telefono')}
          {field('Fecha de nacimiento', 'fecha_nacimiento', 'date')}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Notas</label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              rows={3}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
