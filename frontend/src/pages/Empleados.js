import React, { useEffect, useState, useCallback } from 'react';
import { getEmpleados, createEmpleado, updateEmpleado, deleteEmpleado } from '../api';
import Modal from '../components/Modal';

const emptyForm = {
  nombre: '',
  apellidos: '',
  email: '',
  password: '',
  telefono: '',
  rol: 'artista',
};

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchEmpleados = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmpleados();
      setEmpleados(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmpleados(); }, [fetchEmpleados]);

  const openNew = () => {
    setEditando(null);
    setForm(emptyForm);
    setError('');
    setModal(true);
  };

  const openEdit = (emp) => {
    setEditando(emp.id);
    setForm({
      nombre: emp.nombre || '',
      apellidos: emp.apellidos || '',
      email: emp.email || '',
      password: '',
      telefono: emp.telefono || '',
      rol: emp.rol || 'artista',
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
        const { password, ...rest } = form;
        await updateEmpleado(editando, rest);
      } else {
        await createEmpleado(form);
      }
      setModal(false);
      fetchEmpleados();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desactivar este empleado?')) return;
    try {
      await deleteEmpleado(id);
      fetchEmpleados();
    } catch (e) {
      console.error(e);
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
        <h1 className="text-2xl font-bold text-white">Empleados</h1>
        <button
          onClick={openNew}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo empleado
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Cargando...</div>
        ) : empleados.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No hay empleados registrados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Nombre</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 hidden md:table-cell">Teléfono</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Rol</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Estado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {empleados.map((e) => (
                  <tr key={e.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-700/50 rounded-full flex items-center justify-center text-purple-300 text-xs font-bold flex-shrink-0">
                          {e.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-white text-sm font-medium">{e.nombre} {e.apellidos}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className="text-gray-400 text-sm">{e.email}</span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-gray-400 text-sm">{e.telefono || '—'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        e.rol === 'admin'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {e.rol === 'admin' ? 'Admin' : 'Artista'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        e.activo
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {e.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center gap-3 justify-end">
                        <button onClick={() => openEdit(e)} className="text-gray-400 hover:text-white text-sm transition-colors">
                          Editar
                        </button>
                        {e.activo && (
                          <button onClick={() => handleDelete(e.id)} className="text-gray-400 hover:text-red-400 text-sm transition-colors">
                            Desactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editando ? 'Editar empleado' : 'Nuevo empleado'}
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
          {field('Email *', 'email', 'email', { required: true })}
          {!editando && field('Contraseña *', 'password', 'password', { required: !editando })}
          {field('Teléfono', 'telefono')}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Rol *</label>
            <select
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
              required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="artista">Artista</option>
              <option value="admin">Admin</option>
            </select>
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
