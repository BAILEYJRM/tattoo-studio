import React, { useEffect, useState } from 'react';
import {
  getConfiguracion, updateConfiguracion,
  getDiasFestivos, addDiaFestivo, deleteDiaFestivo,
} from '../api';

const TABS = [
  { id: 'estudio', label: 'Información del estudio' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'horarios', label: 'Horarios' },
  { id: 'festivos', label: 'Días festivos' },
  { id: 'facturacion', label: 'Facturación' },
  { id: 'comunicaciones', label: 'Comunicaciones' },
  { id: 'calendario', label: 'Calendario' },
  { id: 'politica', label: 'Política' },
];

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const DIAS_LABEL = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo' };

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-indigo-600' : 'bg-gray-600'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </button>
  );
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, type = 'text', placeholder }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
    />
  );
}

function SaveBtn({ onClick, saving }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
    >
      {saving ? 'Guardando...' : 'Guardar'}
    </button>
  );
}

function parseHorario(valor) {
  if (!valor || valor === 'cerrado') return { abierto: false, apertura: '10:00', cierre: '20:00' };
  const [apertura, cierre] = valor.split('-');
  return { abierto: true, apertura: apertura || '10:00', cierre: cierre || '20:00' };
}

function serializeHorario({ abierto, apertura, cierre }) {
  return abierto ? `${apertura}-${cierre}` : 'cerrado';
}

export default function Configuracion() {
  const [tab, setTab] = useState('estudio');
  const [config, setConfig] = useState({});
  const [festivos, setFestivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [newFestivo, setNewFestivo] = useState({ fecha: '', descripcion: '' });
  const [addingFestivo, setAddingFestivo] = useState(false);

  useEffect(() => {
    Promise.all([getConfiguracion(), getDiasFestivos()]).then(([cfgRes, festRes]) => {
      setConfig(cfgRes.data);
      setFestivos(festRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const c = (clave) => config[clave] ?? '';
  const bool = (clave) => config[clave] === 'true';
  const setC = (clave, valor) => setConfig(prev => ({ ...prev, [clave]: String(valor) }));

  const save = async (claves) => {
    setSaving(true);
    setMsg('');
    try {
      const partial = {};
      claves.forEach(k => { partial[k] = config[k] ?? ''; });
      const res = await updateConfiguracion(partial);
      setConfig(res.data);
      setMsg('Guardado correctamente');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFestivo = async () => {
    if (!newFestivo.fecha) return;
    setAddingFestivo(true);
    try {
      const res = await addDiaFestivo(newFestivo);
      setFestivos(prev => [...prev, res.data].sort((a, b) => a.fecha.localeCompare(b.fecha)));
      setNewFestivo({ fecha: '', descripcion: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Error al añadir festivo');
    } finally {
      setAddingFestivo(false);
    }
  };

  const handleDeleteFestivo = async (id) => {
    await deleteDiaFestivo(id);
    setFestivos(prev => prev.filter(f => f.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Configuración del estudio</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-900 p-1 rounded-xl">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${msg.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
          {msg}
        </div>
      )}

      <div className="bg-gray-900 rounded-xl p-6">

        {/* ── Información del estudio ── */}
        {tab === 'estudio' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Información del estudio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nombre del estudio">
                <Input value={c('estudio_nombre')} onChange={v => setC('estudio_nombre', v)} />
              </Field>
              <Field label="CIF/NIF">
                <Input value={c('estudio_cif')} onChange={v => setC('estudio_cif', v)} />
              </Field>
              <Field label="Dirección">
                <Input value={c('estudio_direccion')} onChange={v => setC('estudio_direccion', v)} />
              </Field>
              <Field label="Código Postal">
                <Input value={c('estudio_cp')} onChange={v => setC('estudio_cp', v)} />
              </Field>
              <Field label="Localidad">
                <Input value={c('estudio_localidad')} onChange={v => setC('estudio_localidad', v)} />
              </Field>
              <Field label="Provincia">
                <Input value={c('estudio_provincia')} onChange={v => setC('estudio_provincia', v)} />
              </Field>
              <Field label="Email">
                <Input value={c('estudio_email')} onChange={v => setC('estudio_email', v)} type="email" />
              </Field>
              <Field label="Teléfono">
                <Input value={c('estudio_telefono')} onChange={v => setC('estudio_telefono', v)} />
              </Field>
              <Field label="Código Higiénico Sanitario">
                <Input value={c('codigo_higienico')} onChange={v => setC('codigo_higienico', v)} />
              </Field>
              <Field label="Instagram" hint="Ej: @mi_estudio">
                <Input value={c('estudio_instagram')} onChange={v => setC('estudio_instagram', v)} placeholder="@usuario" />
              </Field>
              <Field label="Facebook">
                <Input value={c('estudio_facebook')} onChange={v => setC('estudio_facebook', v)} />
              </Field>
            </div>
            <div className="flex justify-end pt-2">
              <SaveBtn onClick={() => save([
                'estudio_nombre','estudio_cif','estudio_direccion','estudio_cp','estudio_localidad',
                'estudio_provincia','estudio_email','estudio_telefono','codigo_higienico',
                'estudio_instagram','estudio_facebook',
              ])} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Servicios ── */}
        {tab === 'servicios' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Servicios activos</h2>
            <p className="text-sm text-gray-400 mb-4">Activa los servicios que ofrece tu estudio. Esto afecta a los filtros, estadísticas y formularios del sistema.</p>
            {[
              { clave: 'servicios_tatuaje', label: 'Tatuaje', desc: 'Activa las citas y opciones relacionadas con tatuajes.' },
              { clave: 'servicios_piercing', label: 'Piercing', desc: 'Habilita la gestión de citas de piercing y sus cuidados.' },
              { clave: 'servicios_microblading', label: 'Microblading', desc: 'Activa el servicio de micropigmentación de cejas.' },
              { clave: 'servicios_laser', label: 'Eliminación láser', desc: 'Habilita el servicio de eliminación de tatuajes con láser.' },
              { clave: 'servicios_barberia', label: 'Barbería', desc: 'Activa el servicio de barbería en el estudio.' },
              { clave: 'servicios_estetica', label: 'Estética', desc: 'Habilita servicios de estética y belleza.' },
            ].map(({ clave, label, desc }) => (
              <div key={clave} className="flex items-center justify-between py-3 border-b border-gray-800">
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
                <Toggle checked={bool(clave)} onChange={() => setC(clave, !bool(clave))} />
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <SaveBtn onClick={() => save([
                'servicios_tatuaje','servicios_piercing','servicios_microblading',
                'servicios_laser','servicios_barberia','servicios_estetica',
              ])} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Horarios ── */}
        {tab === 'horarios' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white mb-4">Horario del estudio</h2>
            {DIAS.map(dia => {
              const horario = parseHorario(c(`horario_${dia}`));
              const update = (patch) => {
                const updated = { ...horario, ...patch };
                setC(`horario_${dia}`, serializeHorario(updated));
              };
              return (
                <div key={dia} className="flex items-center gap-4 py-3 border-b border-gray-800">
                  <span className="text-white text-sm font-medium w-24 flex-shrink-0">{DIAS_LABEL[dia]}</span>
                  <Toggle checked={horario.abierto} onChange={() => update({ abierto: !horario.abierto })} />
                  {horario.abierto ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={horario.apertura}
                        onChange={e => update({ apertura: e.target.value })}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-gray-500 text-sm">—</span>
                      <input
                        type="time"
                        value={horario.cierre}
                        onChange={e => update({ cierre: e.target.value })}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">Cerrado</span>
                  )}
                </div>
              );
            })}
            <div className="flex justify-end pt-2">
              <SaveBtn onClick={() => save(DIAS.map(d => `horario_${d}`))} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Días festivos ── */}
        {tab === 'festivos' && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Días festivos</h2>
            <p className="text-sm text-gray-400 mb-4">Los días festivos se marcan en rojo en el calendario.</p>

            {/* Añadir festivo */}
            <div className="bg-gray-800 rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs text-gray-400 mb-1">Fecha</label>
                <input
                  type="date"
                  value={newFestivo.fecha}
                  onChange={e => setNewFestivo(p => ({ ...p, fecha: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs text-gray-400 mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  value={newFestivo.descripcion}
                  onChange={e => setNewFestivo(p => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Ej: Navidad"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={handleAddFestivo}
                disabled={addingFestivo || !newFestivo.fecha}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Añadir
              </button>
            </div>

            {/* Lista */}
            {festivos.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No hay días festivos registrados</p>
            ) : (
              <div className="space-y-2">
                {festivos.map(f => (
                  <div key={f.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-white text-sm font-medium">
                          {new Date(f.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        {f.descripcion && <p className="text-gray-400 text-xs">{f.descripcion}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFestivo(f.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Facturación ── */}
        {tab === 'facturacion' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Facturación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="IVA por defecto (%)" hint="Se aplica al crear nuevas facturas">
                <Input type="number" value={c('iva_defecto')} onChange={v => setC('iva_defecto', v)} />
              </Field>
              <Field label="Comisión clientes del estudio (%)" hint="Porcentaje que retiene el estudio de citas sin artista asignado">
                <Input type="number" value={c('comision_clientes_estudio')} onChange={v => setC('comision_clientes_estudio', v)} />
              </Field>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="text-white text-sm font-medium">Facturas automáticas</p>
                <p className="text-gray-500 text-xs">Genera facturas automáticamente al completar una cita</p>
              </div>
              <Toggle checked={bool('facturas_automaticas')} onChange={() => setC('facturas_automaticas', !bool('facturas_automaticas'))} />
            </div>
            <div className="flex justify-end pt-2">
              <SaveBtn onClick={() => save(['iva_defecto', 'facturas_automaticas', 'comision_clientes_estudio'])} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Comunicaciones ── */}
        {tab === 'comunicaciones' && (
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white mb-4">Comunicaciones</h2>
            {[
              { clave: 'dni_obligatorio', label: 'DNI obligatorio en consentimientos', desc: 'Requiere que el cliente introduzca su DNI al firmar el consentimiento' },
              { clave: 'enviar_copia_consentimiento_cliente', label: 'Enviar copia del consentimiento al cliente', desc: 'Envía el PDF del consentimiento firmado por email al cliente' },
              { clave: 'enviar_copia_consentimiento_estudio', label: 'Enviar copia del consentimiento al estudio', desc: 'Envía también al email del estudio una copia del consentimiento firmado' },
              { clave: 'incluir_enlace_firma_email', label: 'Incluir enlace de firma en el email de cita', desc: 'Añade un enlace al consentimiento en el email de confirmación de cita' },
            ].map(({ clave, label, desc }) => (
              <div key={clave} className="flex items-center justify-between py-3 border-b border-gray-800">
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
                <Toggle checked={bool(clave)} onChange={() => setC(clave, !bool(clave))} />
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <SaveBtn onClick={() => save([
                'dni_obligatorio','enviar_copia_consentimiento_cliente',
                'enviar_copia_consentimiento_estudio','incluir_enlace_firma_email',
              ])} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Calendario ── */}
        {tab === 'calendario' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Calendario</h2>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="text-white text-sm font-medium">Abrir citas en nueva pestaña</p>
                <p className="text-gray-500 text-xs">Al hacer clic en una cita del calendario se abre en una nueva pestaña del navegador</p>
              </div>
              <Toggle checked={bool('citas_nueva_pestana')} onChange={() => setC('citas_nueva_pestana', !bool('citas_nueva_pestana'))} />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="text-white text-sm font-medium">Forzar texto blanco en eventos</p>
                <p className="text-gray-500 text-xs">Hace que el texto de los eventos del calendario sea siempre blanco, independientemente del color del artista</p>
              </div>
              <Toggle checked={bool('forzar_texto_blanco_calendario')} onChange={() => setC('forzar_texto_blanco_calendario', !bool('forzar_texto_blanco_calendario'))} />
            </div>
            <div className="py-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white text-sm font-medium">Intensidad color artistas</p>
                  <p className="text-gray-500 text-xs">Controla la opacidad del color asignado a cada artista en el calendario</p>
                </div>
                <span className="text-indigo-400 text-sm font-medium">{c('intensidad_color_artistas') || 100}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={c('intensidad_color_artistas') || 100}
                onChange={e => setC('intensidad_color_artistas', e.target.value)}
                className="w-full accent-indigo-500"
              />
            </div>
            <div className="flex justify-end pt-2">
              <SaveBtn onClick={() => save(['citas_nueva_pestana', 'forzar_texto_blanco_calendario', 'intensidad_color_artistas'])} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Política ── */}
        {tab === 'politica' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Política y textos</h2>
            <p className="text-sm text-gray-400">Estos textos aparecen en los emails de confirmación de cita y en los consentimientos.</p>
            <Field label="Política de cancelación">
              <textarea
                value={c('politica_cancelacion')}
                onChange={e => setC('politica_cancelacion', e.target.value)}
                rows={5}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
                placeholder="Escribe aquí la política de cancelación del estudio..."
              />
            </Field>
            <Field label="Información adicional para clientes">
              <textarea
                value={c('info_adicional_clientes')}
                onChange={e => setC('info_adicional_clientes', e.target.value)}
                rows={5}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
                placeholder="Información extra que se incluirá en los emails a clientes..."
              />
            </Field>
            <div className="flex justify-end pt-2">
              <SaveBtn onClick={() => save(['politica_cancelacion', 'info_adicional_clientes'])} saving={saving} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
