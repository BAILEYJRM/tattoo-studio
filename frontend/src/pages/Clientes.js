import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClientes, createCliente, updateCliente, deleteCliente, bulkDeleteClientes, getHistorialCliente, getPdfUrl, getImagenUrl } from '../api';
import Modal from '../components/Modal';
import BulkSelectionBar from '../components/BulkSelectionBar';

const ESTADO_CONFIG = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  confirmada: { label: 'Confirmada', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  completada: { label: 'Completada', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  cancelada: { label: 'Cancelada', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const emptyForm = {
  nombre: '', apellidos: '', segundo_apellido: '', email: '', telefono: '', dni: '',
  pais: '', provincia: '', localidad: '', direccion: '', codigo_postal: '',
  fecha_nacimiento: '', notas: '', sexo: '',
  conflictivo: false, flexible: false, habla_ingles: false,
  es_cliente_estudio: false, acepta_comunicaciones: true, acepta_notificaciones_sistema: true,
  acepta_redes: false, cliente_pruebas: false, como_nos_conocio: '',
  instagram: '', facebook: '', tiktok: '', twitter: '',
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

function fmtFecha(d) {
  if (!d) return '—';
  return new Date(d.includes('T') ? d : d + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Historial del cliente ─────────────────────────────────────────────────────
function HistorialCliente({ clienteId, onClose, onEdit, navigate }) {
  const [tab, setTab] = useState('datos');
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  useEffect(() => {
    getHistorialCliente(clienteId).then(res => setHistorial(res.data)).finally(() => setLoading(false));
  }, [clienteId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { cliente, citas, consentimientos, ventas, imagenes } = historial || {};

  // Agrupar imágenes por cita
  const imagenesPorCita = {};
  (imagenes || []).forEach(img => {
    const key = img.cita_id_ref;
    if (!imagenesPorCita[key]) imagenesPorCita[key] = { fecha: img.cita_fecha, desc: img.cita_descripcion, imgs: [] };
    imagenesPorCita[key].imgs.push(img);
  });

  const TABS = [
    { id: 'datos', label: 'Datos' },
    { id: 'citas', label: `Citas (${citas?.length || 0})` },
    { id: 'consentimientos', label: `Consentimientos (${consentimientos?.length || 0})` },
    { id: 'ventas', label: `Ventas (${ventas?.length || 0})` },
    { id: 'fotos', label: `Fotos (${imagenes?.length || 0})` },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-center p-4 sm:p-6 overflow-y-auto" onClick={onClose}>
      <div className="bg-gray-800 w-full max-w-5xl max-h-full rounded-2xl shadow-2xl flex flex-col my-auto relative overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 px-5 py-4 flex items-center gap-4">
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-white font-semibold text-lg">{cliente?.nombre} {cliente?.apellidos}</h1>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              {cliente?.email && <span className="text-gray-400 text-xs">{cliente.email}</span>}
              {cliente?.telefono && <span className="text-gray-400 text-xs">· {cliente.telefono}</span>}
              {cliente?.conflictivo && <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">⚠ Conflictivo</span>}
              {Number(cliente?.no_shows) > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">{cliente.no_shows} no-shows</span>}
            </div>
          </div>
          <button onClick={() => onEdit(cliente)} className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors shadow-sm">
            Editar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-900 p-1 rounded-xl mb-5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${tab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Datos ── */}
        {tab === 'datos' && cliente && (
          <div className="bg-gray-900 rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {[
                ['Nombre', `${cliente.nombre} ${cliente.apellidos} ${cliente.segundo_apellido || ''}`.trim()],
                ['DNI/Pasaporte', cliente.dni || '—'],
                ['Email', cliente.email || '—'],
                ['Teléfono', cliente.telefono || '—'],
                ['Fecha nacimiento', fmtFecha(cliente.fecha_nacimiento)],
                ['Sexo', cliente.sexo || '—'],
                ['Dirección', [cliente.direccion, cliente.localidad, cliente.provincia, cliente.pais, cliente.codigo_postal].filter(Boolean).join(', ') || '—'],
                ['Cómo nos conoció', cliente.como_nos_conocio || '—'],
                ['Instagram', cliente.instagram || '—'],
                ['Facebook', cliente.facebook || '—'],
                ['TikTok', cliente.tiktok || '—'],
                ['Twitter (X)', cliente.twitter || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-gray-500 text-xs">{label}</p>
                  <p className="text-white mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            {cliente.info_medica && (
              <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-xs font-medium mb-1">Info médica</p>
                <p className="text-gray-300 text-sm whitespace-pre-line">{cliente.info_medica}</p>
              </div>
            )}
            {cliente.notas && (
              <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                <p className="text-gray-500 text-xs font-medium mb-1">Notas</p>
                <p className="text-gray-300 text-sm whitespace-pre-line">{cliente.notas}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Citas ── */}
        {tab === 'citas' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button
                onClick={() => navigate(`/citas?cliente_id=${clienteId}`)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Nueva cita
              </button>
            </div>
            {citas?.length === 0 ? (
              <div className="bg-gray-900 rounded-xl p-8 text-center text-gray-500 text-sm">Sin citas registradas</div>
            ) : (
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Fecha</th>
                      <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden sm:table-cell">Artista</th>
                      <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden md:table-cell">Descripción</th>
                      <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Estado</th>
                      <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citas.map(c => (
                      <tr key={c.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                        <td className="px-4 py-3">
                          <p className="text-white text-xs font-medium">{fmtFecha(c.fecha?.split('T')[0])}</p>
                          <p className="text-gray-500 text-xs">{c.hora_inicio?.slice(0,5)}{c.hora_fin ? ` – ${c.hora_fin.slice(0,5)}` : ''}</p>
                          {c.no_presentado && <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">No-show</span>}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            {c.artista_color && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.artista_color }} />}
                            <span className="text-gray-300 text-xs">{c.artista_nombre || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-gray-400 text-xs line-clamp-1">{c.descripcion || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${(ESTADO_CONFIG[c.estado] || ESTADO_CONFIG.pendiente).color}`}>
                            {(ESTADO_CONFIG[c.estado] || ESTADO_CONFIG.pendiente).label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="text-white text-xs font-medium">{c.precio ? `${Number(c.precio).toFixed(2)}€` : '—'}</p>
                          {Number(c.importe_senal) > 0 && (
                            <p className="text-gray-500 text-xs">Señal: {Number(c.importe_senal).toFixed(0)}€</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Consentimientos ── */}
        {tab === 'consentimientos' && (
          consentimientos?.length === 0 ? (
            <div className="bg-gray-900 rounded-xl p-8 text-center text-gray-500 text-sm">Sin consentimientos registrados</div>
          ) : (
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Fecha</th>
                    <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Tipo</th>
                    <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden sm:table-cell">Empleado</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {consentimientos.map(con => (
                    <tr key={con.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <span className="text-white text-xs">{fmtFecha(con.firmado_en)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {con.plantilla_nombre || con.tipo || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-gray-400 text-xs">{con.empleado_nombre || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {con.pdf_path && (
                          <a href={getPdfUrl(con.pdf_path)} target="_blank" rel="noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors">
                            Ver PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ── Ventas ── */}
        {tab === 'ventas' && (
          ventas?.length === 0 ? (
            <div className="bg-gray-900 rounded-xl p-8 text-center text-gray-500 text-sm">Sin ventas registradas</div>
          ) : (
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Fecha</th>
                    <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden sm:table-cell">Método pago</th>
                    <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Estado</th>
                    <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map(v => (
                    <tr key={v.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <span className="text-white text-xs">{fmtFecha(v.fecha)}</span>
                        {v.notas && <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{v.notas}</p>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-gray-400 text-xs capitalize">{v.metodo_pago || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${v.estado === 'pagado' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                          {v.estado || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-white text-sm font-semibold">{Number(v.total || 0).toFixed(2)}€</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ── Fotos ── */}
        {tab === 'fotos' && (
          Object.keys(imagenesPorCita).length === 0 ? (
            <div className="bg-gray-900 rounded-xl p-8 text-center text-gray-500 text-sm">Sin fotos registradas</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(imagenesPorCita).map(([citaId, grupo]) => (
                <div key={citaId} className="bg-gray-900 rounded-xl p-4">
                  <div className="mb-3">
                    <p className="text-white text-sm font-medium">{fmtFecha(grupo.fecha?.split('T')[0])}</p>
                    {grupo.desc && <p className="text-gray-400 text-xs mt-0.5">{grupo.desc}</p>}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {grupo.imgs.map(img => (
                      <button key={img.id} onClick={() => setFotoAmpliada(img)} className="group relative aspect-square">
                        <img src={getImagenUrl(img.imagen_path)} alt={img.tipo}
                          className="w-full h-full object-cover rounded-lg group-hover:opacity-80 transition-opacity" />
                        <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1 rounded">{img.tipo}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
      </div>

      {/* Lightbox */}
      {fotoAmpliada && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center" onClick={() => setFotoAmpliada(null)}>
          <img src={getImagenUrl(fotoAmpliada.imagen_path)} alt={fotoAmpliada.tipo}
            className="max-w-full max-h-full object-contain rounded-lg p-4" />
        </div>
      )}
    </div>
  );
}

// ── Formulario cliente ────────────────────────────────────────────────────────
function FormCliente({ form, setF, saving, error, onSubmit, onClose, editando }) {
  const menorDeEdad = esMenorDeEdad(form.fecha_nacimiento);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}
      
      {/* IDENTIFICACIÓN */}
      <SeccionHeader title="Identificación" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
          <input required value={form.nombre} onChange={(e) => setF('nombre', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Primer apellido *</label>
          <input required value={form.apellidos} onChange={(e) => setF('apellidos', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Segundo apellido</label>
          <input value={form.segundo_apellido} onChange={(e) => setF('segundo_apellido', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">DNI / Pasaporte</label>
          <input value={form.dni} onChange={(e) => setF('dni', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
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
      <div className="grid grid-cols-2 gap-3">
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
      </div>

      {/* DIRECCIÓN */}
      <SeccionHeader title="Dirección" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">País</label>
          <input value={form.pais} onChange={(e) => setF('pais', e.target.value)} placeholder="Ej. España"
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Provincia</label>
          <input value={form.provincia} onChange={(e) => setF('provincia', e.target.value)} placeholder="Ej. Madrid"
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Localidad</label>
          <input value={form.localidad} onChange={(e) => setF('localidad', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Código Postal</label>
          <input value={form.codigo_postal} onChange={(e) => setF('codigo_postal', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Dirección (calle, vía, avda...)</label>
        <input value={form.direccion} onChange={(e) => setF('direccion', e.target.value)}
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      {/* NOTAS Y MARKETING */}
      <SeccionHeader title="Notas y Marketing" />
      <div>
        <label className="block text-xs text-gray-400 mb-1">¿Cómo nos ha conocido?</label>
        <input value={form.como_nos_conocio} onChange={(e) => setF('como_nos_conocio', e.target.value)} placeholder="Instagram, Amigo, Buscador..."
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Notas internas</label>
        <textarea value={form.notas} onChange={(e) => setF('notas', e.target.value)} rows={2}
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>

      {/* REDES SOCIALES */}
      <SeccionHeader title="Redes Sociales" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Instagram</label>
          <input value={form.instagram} onChange={(e) => setF('instagram', e.target.value)} placeholder="@usuario"
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">TikTok</label>
          <input value={form.tiktok} onChange={(e) => setF('tiktok', e.target.value)} placeholder="@usuario"
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Facebook</label>
          <input value={form.facebook} onChange={(e) => setF('facebook', e.target.value)} placeholder="Perfil o nombre"
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Twitter (X)</label>
          <input value={form.twitter} onChange={(e) => setF('twitter', e.target.value)} placeholder="@usuario"
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" />
        </div>
      </div>

      {/* FLAGS */}
      <SeccionHeader title="Flags y Ajustes" />
      <div className="grid grid-cols-2 gap-2">
        <Toggle small label="Conflictivo" checked={form.conflictivo} onChange={() => setF('conflictivo', !form.conflictivo)} />
        <Toggle small label="Flexible" checked={form.flexible} onChange={() => setF('flexible', !form.flexible)} />
        <Toggle small label="Habla inglés" checked={form.habla_ingles} onChange={() => setF('habla_ingles', !form.habla_ingles)} />
        <Toggle small label="Cliente del estudio" checked={form.es_cliente_estudio} onChange={() => setF('es_cliente_estudio', !form.es_cliente_estudio)} />
        <Toggle small label="Acepta comunicaciones" checked={form.acepta_comunicaciones} onChange={() => setF('acepta_comunicaciones', !form.acepta_comunicaciones)} />
        <Toggle small label="Notificaciones de sistema" checked={form.acepta_notificaciones_sistema} onChange={() => setF('acepta_notificaciones_sistema', !form.acepta_notificaciones_sistema)} />
        <Toggle small label="Acepta redes sociales" checked={form.acepta_redes} onChange={() => setF('acepta_redes', !form.acepta_redes)} />
        <Toggle small label="Cliente de pruebas" checked={form.cliente_pruebas} onChange={() => setF('cliente_pruebas', !form.cliente_pruebas)} />
      </div>

      <SeccionHeader title="Información médica" />
      <div>
        <label className="block text-xs text-gray-400 mb-1">Info médica <span className="text-gray-600">(aparece en consentimientos)</span></label>
        <textarea value={form.info_medica} onChange={(e) => setF('info_medica', e.target.value)} rows={2}
          placeholder="Alergias, medicamentos, enfermedades relevantes..."
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-gray-500" />
      </div>

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
        <button type="button" onClick={onClose}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [filtroFlag, setFiltroFlag] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [clienteDetalleId, setClienteDetalleId] = useState(null);
  
  // Selección en masa
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchClientes = useCallback(async (search) => {
    setLoading(true);
    try {
      const res = await getClientes(search || undefined);
      setClientes(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchClientes(buscar), !buscar ? 0 : 400);
    return () => clearTimeout(t);
  }, [buscar, fetchClientes]);

  const openNew = () => { setEditando(null); setForm(emptyForm); setError(''); setModal(true); };

  const openEdit = (c) => {
    setEditando(c.id);
    setForm({
      nombre: c.nombre || '', apellidos: c.apellidos || '', segundo_apellido: c.segundo_apellido || '',
      email: c.email || '', telefono: c.telefono || '', dni: c.dni || '',
      pais: c.pais || '', provincia: c.provincia || '', localidad: c.localidad || '',
      direccion: c.direccion || '', codigo_postal: c.codigo_postal || '',
      fecha_nacimiento: c.fecha_nacimiento?.split('T')[0] || '',
      notas: c.notas || '', sexo: c.sexo || '',
      instagram: c.instagram || '', facebook: c.facebook || '',
      tiktok: c.tiktok || '', twitter: c.twitter || '',
      conflictivo: c.conflictivo || false, flexible: c.flexible || false,
      habla_ingles: c.habla_ingles || false, es_cliente_estudio: c.es_cliente_estudio || false,
      cliente_pruebas: c.cliente_pruebas || false,
      como_nos_conocio: c.como_nos_conocio || '',
      acepta_comunicaciones: c.acepta_comunicaciones ?? true,
      acepta_notificaciones_sistema: c.acepta_notificaciones_sistema ?? true,
      acepta_redes: c.acepta_redes || false,
      info_medica: c.info_medica || '',
      tutor_legal_nombre: c.tutor_legal_nombre || '',
      tutor_legal_dni: c.tutor_legal_dni || '',
      tutor_legal_telefono: c.tutor_legal_telefono || '',
    });
    setError('');
    setClienteDetalleId(null);
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

  const toggleSelectAll = () => {
    if (selectedIds.length === clientesFiltrados.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(clientesFiltrados.map(c => c.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`¿Seguro que deseas eliminar a ${c.nombre}?`)) return;
    try {
      await deleteCliente(c.id);
      fetchClientes(buscar);
      setSelectedIds(prev => prev.filter(x => x !== c.id));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`¿Eliminar ${selectedIds.length} clientes?`)) return;
    try {
      await bulkDeleteClientes(selectedIds);
      fetchClientes(buscar);
      setSelectedIds([]);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  // Mostrar historial si hay un cliente seleccionado
  // Se renderiza más abajo encima de la vista principal

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clientes</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/clientes/duplicados')}
            className="text-gray-400 hover:text-white text-xs px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Duplicados
          </button>
          <button onClick={openNew}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nuevo cliente
          </button>
        </div>
      </div>

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
                  <th className="px-5 py-3 w-10">
                    <input type="checkbox"
                      checked={clientesFiltrados.length > 0 && selectedIds.length === clientesFiltrados.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500" />
                  </th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Nombre</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 hidden md:table-cell">Teléfono</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 hidden lg:table-cell">No-shows</th>
                  <th className="px-5 py-3 text-right text-xs text-gray-500 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((c) => (
                  <tr key={c.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3">
                      <input type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500" />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-700/50 rounded-full flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                          {c.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button onClick={() => setClienteDetalleId(c.id)}
                              className="text-white text-sm font-medium hover:text-indigo-300 transition-colors text-left">
                              {c.nombre} {c.apellidos}
                            </button>
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
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setClienteDetalleId(c.id)} title="Ver detalles" className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={() => openEdit(c)} title="Editar" className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(c)} title="Eliminar" className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editando ? 'Editar cliente' : 'Nuevo cliente'} maxWidth="max-w-3xl">
        <FormCliente form={form} setF={setF} saving={saving} error={error} onSubmit={handleSubmit} onClose={() => setModal(false)} editando={editando} />
      </Modal>

      {clienteDetalleId && (
        <HistorialCliente
          clienteId={clienteDetalleId}
          onClose={() => setClienteDetalleId(null)}
          onEdit={openEdit}
          navigate={navigate}
        />
      )}

      <BulkSelectionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onDelete={handleBulkDelete}
      />
    </div>
  );
}
