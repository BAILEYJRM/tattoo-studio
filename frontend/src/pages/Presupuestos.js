import React, { useEffect, useState, useCallback } from 'react';
import { getPresupuestos, createPresupuesto, updatePresupuesto, generarTokenPresupuesto, getClientes, getEmpleados, getProyectos } from '../api';
import Modal from '../components/Modal';
import PresupuestoImprimible from '../components/PresupuestoImprimible';

/* ── Configuración de estados ──────────────────────────────────────── */
const ESTADO_PRESUPUESTO = {
  Borrador:   { label: 'Borrador',   color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  Enviado:    { label: 'Enviado',    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  Aceptado:   { label: 'Aceptado',   color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  Rechazado:  { label: 'Rechazado',  color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  Caducado:   { label: 'Caducado',   color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
};

const emptyForm = {
  cliente_id: '', proyecto_id: '', artista_id: '', fecha: new Date().toISOString().slice(0, 10),
  validez: '', servicios: '', sesiones_estimadas: '', precio_por_sesion: '',
  horas_estimadas: '', precio_fijo: '', descuento: '0', impuesto: '21',
  deposito_requerido: '', total_estimado: '', observaciones: '',
  condiciones: '', politica_cancelacion: '', estado: 'Borrador',
};

function fmtFecha(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Badge({ estado }) {
  const cfg = ESTADO_PRESUPUESTO[estado] || { label: estado, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>;
}

/* ── Componente principal ──────────────────────────────────────────── */
export default function Presupuestos() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [tokenCopiado, setTokenCopiado] = useState(null);
  const [generandoToken, setGenerandoToken] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [imprimiendo, setImprimiendo] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [presRes, cliRes, empRes, projRes] = await Promise.all([
        getPresupuestos(), getClientes(), getEmpleados(), getProyectos()
      ]);
      setPresupuestos(presRes.data);
      setClientes(cliRes.data);
      setEmpleados(empRes.data);
      setProyectos(projRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirCrear = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };

  const abrirEditar = (p) => {
    setForm({
      cliente_id: p.cliente_id || '',
      proyecto_id: p.proyecto_id || '',
      artista_id: p.artista_id || '',
      fecha: p.fecha ? new Date(p.fecha).toISOString().slice(0, 10) : '',
      validez: p.validez ? new Date(p.validez).toISOString().slice(0, 10) : '',
      servicios: p.servicios || '',
      sesiones_estimadas: p.sesiones_estimadas || '',
      precio_por_sesion: p.precio_por_sesion || '',
      horas_estimadas: p.horas_estimadas || '',
      precio_fijo: p.precio_fijo || '',
      descuento: p.descuento || '0',
      impuesto: p.impuesto || '21',
      deposito_requerido: p.deposito_requerido || '',
      total_estimado: p.total_estimado || '',
      observaciones: p.observaciones || '',
      condiciones: p.condiciones || '',
      politica_cancelacion: p.politica_cancelacion || '',
      estado: p.estado || 'Borrador',
    });
    setEditId(p.id);
    setModalOpen(true);
  };

  const guardar = async () => {
    try {
      const payload = {
        ...form,
        cliente_id: form.cliente_id || null,
        proyecto_id: form.proyecto_id || null,
        artista_id: form.artista_id || null,
        sesiones_estimadas: form.sesiones_estimadas || null,
        precio_por_sesion: form.precio_por_sesion || null,
        horas_estimadas: form.horas_estimadas || null,
        precio_fijo: form.precio_fijo || null,
        deposito_requerido: form.deposito_requerido || null,
        total_estimado: form.total_estimado || null,
      };
      if (editId) await updatePresupuesto(editId, payload);
      else await createPresupuesto(payload);
      setModalOpen(false);
      cargar();
    } catch (e) { console.error(e); }
  };

  const generarToken = async (id) => {
    setGenerandoToken(id);
    try {
      const res = await generarTokenPresupuesto(id);
      const publicUrl = `${window.location.origin}/presupuesto/${res.data.token}`;
      await navigator.clipboard.writeText(publicUrl);
      setTokenCopiado(id);
      setTimeout(() => setTokenCopiado(null), 3000);
      return publicUrl;
    } catch (e) { console.error(e); return null; }
    finally { setGenerandoToken(null); }
  };

  const compartirWhatsApp = async (id) => {
    let publicUrl = await generarToken(id);
    if (publicUrl) {
      const msg = encodeURIComponent(`Hola! Aquí tienes el presupuesto de tu proyecto: ${publicUrl}`);
      window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
    }
  };

  const compartirEmail = async (id) => {
    let publicUrl = await generarToken(id);
    if (publicUrl) {
      const subject = encodeURIComponent('Presupuesto de tu proyecto - Tattoo Studio');
      const body = encodeURIComponent(`Hola,\n\nPuedes consultar los detalles de tu presupuesto en el siguiente enlace:\n${publicUrl}\n\nUn saludo,\nEl equipo de Tattoo Studio`);
      window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
    }
  };

  const getNombre = (list, id, field = 'nombre') => {
    const item = list.find(i => i.id === id);
    if (!item) return '—';
    return item.apellidos ? `${item[field]} ${item.apellidos}`.trim() : item[field];
  };

  const inp = 'w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-500';

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Presupuestos</h1>
          <p className="text-gray-400 text-sm mt-0.5">Crea y comparte presupuestos con tus clientes</p>
        </div>
        <button onClick={abrirCrear}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Presupuesto
        </button>
      </div>

      {/* ── Tabla ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : presupuestos.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">No hay presupuestos creados</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="px-4 py-3 font-medium">Ref</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Cliente</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Proyecto</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Fecha</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {presupuestos.map(p => (
                  <tr key={p.id} className="hover:bg-gray-700/30 transition-colors cursor-pointer" onClick={() => setDetalle(p)}>
                    <td className="px-4 py-3 text-white font-mono text-xs">#{String(p.id).padStart(4, '0')}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-300">{getNombre(clientes, p.cliente_id)}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs">{getNombre(proyectos, p.proyecto_id)}</td>
                    <td className="px-4 py-3 text-white font-medium">
                      {p.total_estimado ? `${Number(p.total_estimado).toFixed(2)} €` : '—'}
                    </td>
                    <td className="px-4 py-3"><Badge estado={p.estado} /></td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">{fmtFecha(p.fecha)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Botón generar/copiar token */}
                        <button onClick={(e) => { e.stopPropagation(); generarToken(p.id); }}
                          disabled={generandoToken === p.id}
                          className={`p-1.5 rounded-lg transition-colors text-xs ${
                            tokenCopiado === p.id
                              ? 'text-green-400 bg-green-500/10'
                              : 'text-gray-400 hover:text-indigo-400 hover:bg-gray-700'
                          }`}
                          title={tokenCopiado === p.id ? '¡URL copiada!' : 'Generar enlace público'}>
                          {generandoToken === p.id ? (
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          ) : tokenCopiado === p.id ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          )}
                        </button>
                        {/* Botón editar */}
                        <button onClick={(e) => { e.stopPropagation(); abrirEditar(p); }}
                          className="text-gray-400 hover:text-indigo-400 transition-colors p-1.5 rounded-lg hover:bg-gray-700">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Detalle rápido ── */}
      {detalle && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-center p-4 overflow-y-auto" onClick={() => setDetalle(null)}>
          <div className="bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl my-auto overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gray-900 border-b border-gray-700 px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold text-lg">Presupuesto #{String(detalle.id).padStart(4, '0')}</h2>
                <Badge estado={detalle.estado} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => { generarToken(detalle.id); }}
                  className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {tokenCopiado === detalle.id ? '¡Copiado!' : 'Copiar Enlace'}
                </button>

                <button onClick={() => compartirWhatsApp(detalle.id)}
                  className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1">
                  <span>WhatsApp</span>
                </button>

                <button onClick={() => compartirEmail(detalle.id)}
                  className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-1">
                  <span>Email</span>
                </button>

                <button onClick={() => setImprimiendo(detalle)}
                  className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-1">
                  <span>PDF</span>
                </button>

                <button onClick={() => { setDetalle(null); abrirEditar(detalle); }}
                  className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Editar</button>
                <button onClick={() => setDetalle(null)}
                  className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500 block text-xs">Cliente</span><span className="text-white">{getNombre(clientes, detalle.cliente_id)}</span></div>
              <div><span className="text-gray-500 block text-xs">Artista</span><span className="text-white">{getNombre(empleados, detalle.artista_id)}</span></div>
              <div><span className="text-gray-500 block text-xs">Fecha</span><span className="text-white">{fmtFecha(detalle.fecha)}</span></div>
              <div><span className="text-gray-500 block text-xs">Validez</span><span className="text-white">{fmtFecha(detalle.validez)}</span></div>
              <div><span className="text-gray-500 block text-xs">Sesiones est.</span><span className="text-white">{detalle.sesiones_estimadas || '—'}</span></div>
              <div><span className="text-gray-500 block text-xs">Precio/sesión</span><span className="text-white">{detalle.precio_por_sesion ? `${Number(detalle.precio_por_sesion).toFixed(2)} €` : '—'}</span></div>
              <div><span className="text-gray-500 block text-xs">Total estimado</span><span className="text-white font-semibold text-lg">{detalle.total_estimado ? `${Number(detalle.total_estimado).toFixed(2)} €` : '—'}</span></div>
              <div><span className="text-gray-500 block text-xs">Depósito requerido</span><span className="text-white">{detalle.deposito_requerido ? `${Number(detalle.deposito_requerido).toFixed(2)} €` : '—'}</span></div>
              <div className="col-span-2"><span className="text-gray-500 block text-xs">Servicios</span><span className="text-white whitespace-pre-wrap">{detalle.servicios || '—'}</span></div>
              <div className="col-span-2"><span className="text-gray-500 block text-xs">Observaciones</span><span className="text-gray-300 whitespace-pre-wrap">{detalle.observaciones || '—'}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Crear/Editar ── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'} maxWidth="max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Cliente</label>
            <select className={inp} value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})}>
              <option value="">Sin cliente</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellidos || ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Proyecto</label>
            <select className={inp} value={form.proyecto_id} onChange={e => setForm({...form, proyecto_id: e.target.value})}>
              <option value="">Sin proyecto</option>
              {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Artista</label>
            <select className={inp} value={form.artista_id} onChange={e => setForm({...form, artista_id: e.target.value})}>
              <option value="">Sin artista</option>
              {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Estado</label>
            <select className={inp} value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
              {Object.keys(ESTADO_PRESUPUESTO).map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Fecha</label>
            <input className={inp} type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Válido hasta</label>
            <input className={inp} type="date" value={form.validez} onChange={e => setForm({...form, validez: e.target.value})} />
          </div>

          {/* Sección económica */}
          <p className="sm:col-span-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider pt-2 pb-1 border-t border-gray-700">Desglose económico</p>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Sesiones estimadas</label>
            <input className={inp} type="number" min="1" value={form.sesiones_estimadas} onChange={e => setForm({...form, sesiones_estimadas: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Precio por sesión (€)</label>
            <input className={inp} type="number" min="0" step="0.01" value={form.precio_por_sesion} onChange={e => setForm({...form, precio_por_sesion: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Horas estimadas</label>
            <input className={inp} type="number" min="0" step="0.5" value={form.horas_estimadas} onChange={e => setForm({...form, horas_estimadas: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Precio fijo (€)</label>
            <input className={inp} type="number" min="0" step="0.01" value={form.precio_fijo} onChange={e => setForm({...form, precio_fijo: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Descuento (%)</label>
            <input className={inp} type="number" min="0" max="100" value={form.descuento} onChange={e => setForm({...form, descuento: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Impuesto (%)</label>
            <input className={inp} type="number" min="0" max="100" value={form.impuesto} onChange={e => setForm({...form, impuesto: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Depósito requerido (€)</label>
            <input className={inp} type="number" min="0" step="0.01" value={form.deposito_requerido} onChange={e => setForm({...form, deposito_requerido: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Total estimado (€)</label>
            <input className={inp} type="number" min="0" step="0.01" value={form.total_estimado} onChange={e => setForm({...form, total_estimado: e.target.value})} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Servicios incluidos</label>
            <textarea className={inp} rows={2} value={form.servicios} onChange={e => setForm({...form, servicios: e.target.value})} placeholder="Diseño personalizado, tatuaje, retoque…" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Observaciones</label>
            <textarea className={inp} rows={2} value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Condiciones</label>
            <textarea className={inp} rows={2} value={form.condiciones} onChange={e => setForm({...form, condiciones: e.target.value})} placeholder="Condiciones de pago, plazos…" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Política de cancelación</label>
            <textarea className={inp} rows={2} value={form.politica_cancelacion} onChange={e => setForm({...form, politica_cancelacion: e.target.value})} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancelar</button>
          <button onClick={guardar}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20">
            {editId ? 'Guardar Cambios' : 'Crear Presupuesto'}
          </button>
        </div>
      </Modal>

      {/* Vista previa imprimible */}
      {imprimiendo && (
        <PresupuestoImprimible
          presupuesto={imprimiendo}
          cliente={clientes.find(c => c.id === imprimiendo.cliente_id)}
          proyecto={proyectos.find(p => p.id === imprimiendo.proyecto_id)}
          onClose={() => setImprimiendo(null)}
        />
      )}
    </div>
  );
}
