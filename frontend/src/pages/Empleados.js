import React, { useEffect, useState, useCallback } from 'react';
import {
  getEmpleados, createEmpleado, updateEmpleado, deleteEmpleado, getAusencias, crearAusencia, eliminarAusencia,
  getTintasPorDefecto, addTintaDefectoArtista, removeTintaDefectoArtista,
  getAgujasPorDefecto, addAgujaDefectoArtista, removeAgujaDefectoArtista,
  getTintas, getAgujas,
} from '../api';
import Modal from '../components/Modal';

const emptyForm = {
  nombre: '', apellidos: '', email: '', password: '', telefono: '', rol: 'artista',
  nombre_artistico: '', estilo_principal: '', color_calendario: '#6366f1',
  instagram: '', comision_porcentaje: '',
  puede_crear_citas: true, puede_ver_companeros: true, notificar_nueva_cita: true,
};

const emptyAusencia = { fecha_inicio: '', fecha_fin: '', hora_inicio: '', hora_fin: '', motivo: '' };

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div onClick={onChange}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-600'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  );
}

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [modalMaterial, setModalMaterial] = useState(false);
  const [empMaterial, setEmpMaterial] = useState(null);
  const [matTintas, setMatTintas] = useState([]);
  const [matAgujas, setMatAgujas] = useState([]);
  const [allTintas, setAllTintas] = useState([]);
  const [allAgujas, setAllAgujas] = useState([]);
  const [loadingMat, setLoadingMat] = useState(false);
  const [buscaTinta, setBuscaTinta] = useState('');
  const [buscaAguja, setBuscaAguja] = useState('');

  const [modalAusencias, setModalAusencias] = useState(false);
  const [empAusencias, setEmpAusencias] = useState(null);
  const [ausencias, setAusencias] = useState([]);
  const [loadingAus, setLoadingAus] = useState(false);
  const [formAus, setFormAus] = useState(emptyAusencia);
  const [savingAus, setSavingAus] = useState(false);

  const fetchEmpleados = useCallback(async () => {
    setLoading(true);
    try { const res = await getEmpleados(); setEmpleados(res.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEmpleados(); }, [fetchEmpleados]);

  const setF = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const openNew = () => { setEditando(null); setForm(emptyForm); setError(''); setModal(true); };

  const openEdit = (emp) => {
    setEditando(emp.id);
    setForm({
      nombre: emp.nombre || '', apellidos: emp.apellidos || '',
      email: emp.email || '', password: '', telefono: emp.telefono || '', rol: emp.rol || 'artista',
      nombre_artistico: emp.nombre_artistico || '', estilo_principal: emp.estilo_principal || '',
      color_calendario: emp.color_calendario || '#6366f1',
      instagram: emp.instagram || '', comision_porcentaje: emp.comision_porcentaje || '',
      puede_crear_citas: emp.puede_crear_citas ?? true,
      puede_ver_companeros: emp.puede_ver_companeros ?? true,
      notificar_nueva_cita: emp.notificar_nueva_cita ?? true,
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
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desactivar este empleado?')) return;
    try { await deleteEmpleado(id); fetchEmpleados(); }
    catch (e) { console.error(e); }
  };

  const openAusencias = async (emp) => {
    setEmpAusencias(emp);
    setFormAus(emptyAusencia);
    setModalAusencias(true);
    setLoadingAus(true);
    try { const res = await getAusencias(emp.id); setAusencias(res.data); }
    catch (e) { console.error(e); }
    finally { setLoadingAus(false); }
  };

  const handleCrearAusencia = async (e) => {
    e.preventDefault();
    setSavingAus(true);
    try {
      await crearAusencia(empAusencias.id, formAus);
      const res = await getAusencias(empAusencias.id);
      setAusencias(res.data);
      setFormAus(emptyAusencia);
    } catch (err) { console.error(err); }
    finally { setSavingAus(false); }
  };

  const handleEliminarAusencia = async (id) => {
    try {
      await eliminarAusencia(id);
      setAusencias((a) => a.filter((x) => x.id !== id));
    } catch (e) { console.error(e); }
  };

  const openMaterial = async (emp) => {
    setEmpMaterial(emp);
    setBuscaTinta(''); setBuscaAguja('');
    setModalMaterial(true);
    setLoadingMat(true);
    try {
      const [tDef, aDef, tAll, aAll] = await Promise.all([
        getTintasPorDefecto(emp.id),
        getAgujasPorDefecto(emp.id),
        getTintas(),
        getAgujas(),
      ]);
      setMatTintas(tDef.data); setMatAgujas(aDef.data);
      setAllTintas(tAll.data); setAllAgujas(aAll.data);
    } catch (e) { console.error(e); }
    finally { setLoadingMat(false); }
  };

  const handleAddTintaDef = async (tinta_id) => {
    try {
      await addTintaDefectoArtista(empMaterial.id, tinta_id);
      const res = await getTintasPorDefecto(empMaterial.id);
      setMatTintas(res.data);
    } catch (e) { console.error(e); }
  };

  const handleRemoveTintaDef = async (tinta_id) => {
    try {
      await removeTintaDefectoArtista(empMaterial.id, tinta_id);
      setMatTintas((t) => t.filter((x) => x.id !== tinta_id));
    } catch (e) { console.error(e); }
  };

  const handleAddAgujasDef = async (aguja_id) => {
    try {
      await addAgujaDefectoArtista(empMaterial.id, aguja_id);
      const res = await getAgujasPorDefecto(empMaterial.id);
      setMatAgujas(res.data);
    } catch (e) { console.error(e); }
  };

  const handleRemoveAgujasDef = async (aguja_id) => {
    try {
      await removeAgujaDefectoArtista(empMaterial.id, aguja_id);
      setMatAgujas((a) => a.filter((x) => x.id !== aguja_id));
    } catch (e) { console.error(e); }
  };

  const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Empleados</h1>
        <button onClick={openNew}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
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
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 hidden md:table-cell">Estilo</th>
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
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: e.color_calendario || '#6366f1' }}>
                          {e.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{e.nombre} {e.apellidos}</p>
                          {e.nombre_artistico && <p className="text-gray-500 text-xs">{e.nombre_artistico}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell"><span className="text-gray-400 text-sm">{e.email}</span></td>
                    <td className="px-5 py-3 hidden md:table-cell"><span className="text-gray-400 text-sm">{e.estilo_principal || '—'}</span></td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${e.rol === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                        {e.rol === 'admin' ? 'Admin' : 'Artista'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${e.activo ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {e.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center gap-3 justify-end">
                        <button onClick={() => openEdit(e)} className="text-gray-400 hover:text-white text-sm transition-colors">Editar</button>
                        <button onClick={() => openAusencias(e)} className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors">Ausencias</button>
                        <button onClick={() => openMaterial(e)} className="text-teal-400 hover:text-teal-300 text-sm transition-colors">Material</button>
                        {e.activo && (
                          <button onClick={() => handleDelete(e.id)} className="text-gray-400 hover:text-red-400 text-sm transition-colors">Desactivar</button>
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

      {/* Modal crear/editar empleado */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editando ? 'Editar empleado' : 'Nuevo empleado'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-400 mb-1">Nombre *</label>
              <input required value={form.nombre} onChange={(e) => setF('nombre', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Apellidos *</label>
              <input required value={form.apellidos} onChange={(e) => setF('apellidos', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">Email *</label>
            <input required type="email" value={form.email} onChange={(e) => setF('email', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          {!editando && (
            <div><label className="block text-xs text-gray-400 mb-1">Contraseña *</label>
              <input required type="password" value={form.password} onChange={(e) => setF('password', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-400 mb-1">Teléfono</label>
              <input value={form.telefono} onChange={(e) => setF('telefono', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Rol *</label>
              <select value={form.rol} onChange={(e) => setF('rol', e.target.value)} required
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="artista">Artista</option>
                <option value="admin">Admin</option>
              </select></div>
          </div>

          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider pt-2 pb-1 border-t border-gray-700">Perfil artístico</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-400 mb-1">Nombre artístico</label>
              <input value={form.nombre_artistico} onChange={(e) => setF('nombre_artistico', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Estilo principal</label>
              <input value={form.estilo_principal} onChange={(e) => setF('estilo_principal', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs text-gray-400 mb-1">Instagram</label>
              <input value={form.instagram} onChange={(e) => setF('instagram', e.target.value)} placeholder="@usuario"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Comisión %</label>
              <input type="number" value={form.comision_porcentaje} onChange={(e) => setF('comision_porcentaje', e.target.value)}
                step="0.01" min="0" max="100" placeholder="0"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" /></div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Color calendario</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color_calendario} onChange={(e) => setF('color_calendario', e.target.value)}
                  className="w-10 h-9 bg-gray-700 rounded-lg cursor-pointer border-0 p-0.5" />
                <span className="text-gray-400 text-xs font-mono">{form.color_calendario}</span>
              </div>
            </div>
          </div>

          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider pt-2 pb-1 border-t border-gray-700">Permisos</p>
          <div className="space-y-2">
            <Toggle label="Puede crear citas" checked={form.puede_crear_citas} onChange={() => setF('puede_crear_citas', !form.puede_crear_citas)} />
            <Toggle label="Puede ver citas de compañeros" checked={form.puede_ver_companeros} onChange={() => setF('puede_ver_companeros', !form.puede_ver_companeros)} />
            <Toggle label="Notificar nuevas citas" checked={form.notificar_nueva_cita} onChange={() => setF('notificar_nueva_cita', !form.notificar_nueva_cita)} />
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

      {/* Modal material por defecto */}
      <Modal isOpen={modalMaterial} onClose={() => setModalMaterial(false)} title={`Material por defecto — ${empMaterial?.nombre || ''}`}>
        <div className="space-y-5">
          {loadingMat ? (
            <div className="text-center py-4 text-gray-500 text-sm">Cargando...</div>
          ) : (
            <>
              {/* Tintas por defecto */}
              <div>
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Tintas por defecto</p>
                {matTintas.length === 0 ? (
                  <p className="text-gray-500 text-xs py-1">Sin tintas asignadas</p>
                ) : (
                  <div className="space-y-1.5 mb-3">
                    {matTintas.map((t) => (
                      <div key={t.id} className="flex items-center justify-between bg-gray-700/50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-gray-600 flex-shrink-0" style={{ backgroundColor: t.color || '#555' }} />
                          <span className="text-white text-sm">{t.nombre}</span>
                          {t.marca && <span className="text-gray-500 text-xs">({t.marca})</span>}
                        </div>
                        <button onClick={() => handleRemoveTintaDef(t.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <input placeholder="Buscar tinta para añadir..." value={buscaTinta} onChange={(e) => setBuscaTinta(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 mb-1.5" />
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {allTintas
                      .filter((t) => !matTintas.some((m) => m.id === t.id))
                      .filter((t) => !buscaTinta || t.nombre.toLowerCase().includes(buscaTinta.toLowerCase()) || (t.marca || '').toLowerCase().includes(buscaTinta.toLowerCase()))
                      .map((t) => (
                        <button key={t.id} onClick={() => handleAddTintaDef(t.id)}
                          className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                          <div className="w-3.5 h-3.5 rounded-full border border-gray-600 flex-shrink-0" style={{ backgroundColor: t.color || '#555' }} />
                          <span className="text-gray-300 text-sm">{t.nombre}</span>
                          {t.marca && <span className="text-gray-500 text-xs">({t.marca})</span>}
                          <svg className="w-3.5 h-3.5 text-gray-600 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Agujas por defecto */}
              <div className="border-t border-gray-700 pt-4">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Agujas por defecto</p>
                {matAgujas.length === 0 ? (
                  <p className="text-gray-500 text-xs py-1">Sin agujas asignadas</p>
                ) : (
                  <div className="space-y-1.5 mb-3">
                    {matAgujas.map((a) => (
                      <div key={a.id} className="flex items-center justify-between bg-gray-700/50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm">{a.marca} {a.modelo}</span>
                          {a.tipo && <span className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">{a.tipo}</span>}
                        </div>
                        <button onClick={() => handleRemoveAgujasDef(a.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <input placeholder="Buscar aguja para añadir..." value={buscaAguja} onChange={(e) => setBuscaAguja(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 mb-1.5" />
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {allAgujas
                      .filter((a) => !matAgujas.some((m) => m.id === a.id))
                      .filter((a) => !buscaAguja || (`${a.marca} ${a.modelo} ${a.tipo}`).toLowerCase().includes(buscaAguja.toLowerCase()))
                      .map((a) => (
                        <button key={a.id} onClick={() => handleAddAgujasDef(a.id)}
                          className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                          <span className="text-gray-300 text-sm">{a.marca} {a.modelo}</span>
                          {a.tipo && <span className="text-gray-500 text-xs">• {a.tipo}</span>}
                          <svg className="w-3.5 h-3.5 text-gray-600 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal ausencias */}
      <Modal isOpen={modalAusencias} onClose={() => setModalAusencias(false)} title={`Ausencias — ${empAusencias?.nombre || ''}`}>
        <div className="space-y-4">
          {/* Lista ausencias */}
          {loadingAus ? (
            <div className="text-center py-4 text-gray-500 text-sm">Cargando...</div>
          ) : ausencias.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">Sin ausencias registradas</p>
          ) : (
            <div className="space-y-2">
              {ausencias.map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-gray-700/50 rounded-lg px-4 py-2.5">
                  <div>
                    <p className="text-white text-sm">
                      {fmtDate(a.fecha_inicio?.split('T')[0])} — {fmtDate(a.fecha_fin?.split('T')[0])}
                      {a.hora_inicio && <span className="text-gray-400 text-xs ml-2">{a.hora_inicio?.slice(0,5)}-{a.hora_fin?.slice(0,5)}</span>}
                    </p>
                    {a.motivo && <p className="text-gray-400 text-xs">{a.motivo}</p>}
                  </div>
                  <button onClick={() => handleEliminarAusencia(a.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors ml-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Formulario nueva ausencia */}
          <form onSubmit={handleCrearAusencia} className="border-t border-gray-700 pt-4 space-y-3">
            <p className="text-sm text-gray-400 font-medium">Nueva ausencia</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-400 mb-1">Fecha inicio *</label>
                <input required type="date" value={formAus.fecha_inicio} onChange={(e) => setFormAus({ ...formAus, fecha_inicio: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-xs text-gray-400 mb-1">Fecha fin *</label>
                <input required type="date" value={formAus.fecha_fin} onChange={(e) => setFormAus({ ...formAus, fecha_fin: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-xs text-gray-400 mb-1">Hora inicio</label>
                <input type="time" value={formAus.hora_inicio} onChange={(e) => setFormAus({ ...formAus, hora_inicio: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-xs text-gray-400 mb-1">Hora fin</label>
                <input type="time" value={formAus.hora_fin} onChange={(e) => setFormAus({ ...formAus, hora_fin: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
            <div><label className="block text-xs text-gray-400 mb-1">Motivo</label>
              <input value={formAus.motivo} onChange={(e) => setFormAus({ ...formAus, motivo: e.target.value })}
                placeholder="Vacaciones, enfermedad, formación..."
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" /></div>
            <button type="submit" disabled={savingAus}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
              {savingAus ? 'Guardando...' : 'Añadir ausencia'}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}
