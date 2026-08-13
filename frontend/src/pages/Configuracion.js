import React, { useEffect, useState, useRef, useContext } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  getConfiguracion, updateConfiguracion, uploadLogo, getImagenUrl,
  getDiasFestivos, addDiaFestivo, deleteDiaFestivo, resetSecuenciaFactura
} from '../api';
import { ThemeContext } from '../context/ThemeContext';

const TABS = [
  { id: 'estudio', key: 'tab_estudio' },
  { id: 'regional', key: 'tab_regional' },
  { id: 'servicios', key: 'tab_servicios' },
  { id: 'horarios', key: 'tab_horarios' },
  { id: 'festivos', key: 'tab_festivos' },
  { id: 'facturacion', key: 'tab_facturacion' },
  { id: 'comunicaciones', key: 'tab_comunicaciones' },
  { id: 'calendario', key: 'tab_calendario' },
  { id: 'politica', key: 'tab_politica' },
  { id: 'personalizacion', key: 'tab_personalizacion' },
];

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const DIAS_LABEL = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo' };

function Toggle({ checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div onClick={onChange}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-600'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
    </label>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
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

function SaveBtn({ onClick, saving, labelSave, labelSaving }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
    >
      {saving ? (labelSaving || 'Guardando...') : (labelSave || 'Guardar')}
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
  const { lang, t } = useLanguage();
  const [tab, setTab] = useState('estudio');
  const [subTabPersonalizacion, setSubTabPersonalizacion] = useState('panel');
  const [config, setConfig] = useState({});
  const [festivos, setFestivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [newFestivo, setNewFestivo] = useState({ fecha: '', descripcion: '' });
  const [addingFestivo, setAddingFestivo] = useState(false);
  const [nuevaSecuenciaFactura, setNuevaSecuenciaFactura] = useState('');

  useEffect(() => {
    Promise.all([getConfiguracion(), getDiasFestivos()]).then(([cfgRes, festRes]) => {
      setConfig(cfgRes.data);
      setFestivos(festRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const c = (clave) => config[clave] ?? '';
  const bool = (clave) => config[clave] === 'true';
  const setC = (clave, valor) => setConfig(prev => ({ ...prev, [clave]: String(valor) }));

  const { updateTheme, changePrimaryColor } = useContext(ThemeContext);

  const save = async (claves) => {
    setSaving(true);
    setMsg('');
    try {
      const partial = {};
      claves.forEach(k => { partial[k] = config[k] ?? ''; });
      const res = await updateConfiguracion(partial);
      setConfig(res.data);
      updateTheme(res.data);
      setMsg('Configuración guardada');
      setTimeout(() => setMsg(''), 3000);
      return true;
    } catch (err) {
      alert('Error al guardar configuración');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleResetSecuenciaFactura = async () => {
    if (!nuevaSecuenciaFactura) return;
    if (!window.confirm(`¿Estás seguro de reiniciar la secuencia de facturas al número ${nuevaSecuenciaFactura}?`)) return;
    setSaving(true);
    try {
      const res = await resetSecuenciaFactura(nuevaSecuenciaFactura);
      alert(res.data.mensaje);
      setNuevaSecuenciaFactura('');
    } catch (err) {
      alert('Error al reiniciar secuencia: ' + (err.response?.data?.error || err.message));
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
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white mb-6">{t('configuracion_titulo')}</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-900 p-1 rounded-xl">
        {TABS.map(tabItem => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === tabItem.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {t(tabItem.key)}
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
            <h2 className="text-lg font-semibold text-white mb-4">{t('info_estudio_titulo')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label={t('nombre_estudio')}>
                <Input value={c('estudio_nombre')} onChange={v => setC('estudio_nombre', v)} />
              </Field>
              <Field label={t('cif_nif')}>
                <Input value={c('estudio_cif')} onChange={v => setC('estudio_cif', v)} />
              </Field>
              <Field label={t('direccion')}>
                <Input value={c('estudio_direccion')} onChange={v => setC('estudio_direccion', v)} />
              </Field>
              <Field label={t('codigo_postal')}>
                <Input value={c('estudio_cp')} onChange={v => setC('estudio_cp', v)} />
              </Field>
              <Field label={t('localidad')}>
                <Input value={c('estudio_localidad')} onChange={v => setC('estudio_localidad', v)} />
              </Field>
              <Field label={t('provincia')}>
                <Input value={c('estudio_provincia')} onChange={v => setC('estudio_provincia', v)} />
              </Field>
              <Field label={t('email')}>
                <Input value={c('estudio_email')} onChange={v => setC('estudio_email', v)} type="email" />
              </Field>
              <Field label={t('telefono')}>
                <Input value={c('estudio_telefono')} onChange={v => setC('estudio_telefono', v)} />
              </Field>
              <Field label={t('codigo_higienico')}>
                <Input value={c('codigo_higienico')} onChange={v => setC('codigo_higienico', v)} />
              </Field>
              <Field label="Instagram" hint={t('instagram_hint')}>
                <Input value={c('estudio_instagram')} onChange={v => setC('estudio_instagram', v)} placeholder="@usuario" />
              </Field>
              <Field label="Facebook">
                <Input value={c('estudio_facebook')} onChange={v => setC('estudio_facebook', v)} />
              </Field>
            </div>
            <div className="flex justify-end pt-2">
              <SaveBtn labelSave={t('guardar')} labelSaving={t('guardando')} onClick={() => save([
                'estudio_nombre','estudio_cif','estudio_direccion','estudio_cp','estudio_localidad',
                'estudio_provincia','estudio_email','estudio_telefono','codigo_higienico',
                'estudio_instagram','estudio_facebook',
              ])} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Ajustes Regionales (US / ES) ── */}
        {tab === 'regional' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">{t('config_regional_titulo')}</h2>
              <p className="text-gray-400 text-xs mt-1">{t('config_regional_sub')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-800/50 p-5 rounded-xl border border-gray-700/50">
              <Field label={t('pais_mercado')}>
                <select value={c('pais') || 'ES'} onChange={e => {
                  const val = e.target.value;
                  setC('pais', val);
                  if (val === 'US') {
                    setC('moneda', 'USD');
                    setC('formato_fecha', 'MM/DD/YYYY');
                    setC('formato_hora', '12h');
                    setC('mostrar_propinas', 'true');
                  } else {
                    setC('moneda', 'EUR');
                    setC('formato_fecha', 'DD/MM/YYYY');
                    setC('formato_hora', '24h');
                    setC('mostrar_propinas', 'false');
                  }
                }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="ES">🇪🇸 España (Europa)</option>
                  <option value="US">🇺🇸 Estados Unidos (USA)</option>
                </select>
              </Field>

              <Field label={t('moneda_principal')}>
                <select value={c('moneda') || 'EUR'} onChange={e => setC('moneda', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="EUR">€ EUR (Euro)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                </select>
              </Field>

              <Field label={t('formato_fecha')}>
                <select value={c('formato_fecha') || 'DD/MM/YYYY'} onChange={e => setC('formato_fecha', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </Field>

              <Field label={t('formato_hora')}>
                <select value={c('formato_hora') || '24h'} onChange={e => setC('formato_hora', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="24h">24h</option>
                  <option value="12h">12h AM/PM</option>
                </select>
              </Field>

              <Field label="Sales Tax (%)">
                <Input type="number" value={c('sales_tax_porcentaje')} onChange={v => setC('sales_tax_porcentaje', v)} placeholder="8.875" />
              </Field>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div>
                  <p className="text-white text-sm font-medium">{t('propina_tpv')}</p>
                </div>
                <Toggle checked={bool('mostrar_propinas')} onChange={() => setC('mostrar_propinas', !bool('mostrar_propinas'))} />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <SaveBtn labelSave={t('guardar')} labelSaving={t('guardando')} onClick={() => save([
                'pais','moneda','formato_fecha','formato_hora','sales_tax_porcentaje','mostrar_propinas',
              ])} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Servicios ── */}
        {tab === 'servicios' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">{t('servicios_titulo')}</h2>
            <p className="text-sm text-gray-400 mb-4">{t('servicios_sub')}</p>
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
              <SaveBtn labelSave={t('guardar')} labelSaving={t('guardando')} onClick={() => save([
                'servicios_tatuaje','servicios_piercing','servicios_microblading',
                'servicios_laser','servicios_barberia','servicios_estetica',
              ])} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Horarios ── */}
        {tab === 'horarios' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white mb-4">{t('horarios_titulo')}</h2>
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
                    <span className="text-gray-500 text-sm">{t('cerrado')}</span>
                  )}
                </div>
              );
            })}
            <div className="flex justify-end pt-2">
              <SaveBtn labelSave={t('guardar')} labelSaving={t('guardando')} onClick={() => save(DIAS.map(d => `horario_${d}`))} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Días festivos ── */}
        {tab === 'festivos' && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">{t('festivos_titulo')}</h2>
            <p className="text-sm text-gray-400 mb-4">{t('festivos_sub')}</p>

            {/* Añadir festivo */}
            <div className="bg-gray-800 rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs text-gray-400 mb-1">{t('fecha_festivo')}</label>
                <input
                  type="date"
                  value={newFestivo.fecha}
                  onChange={e => setNewFestivo(p => ({ ...p, fecha: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs text-gray-400 mb-1">{t('descripcion_festivo')}</label>
                <input
                  type="text"
                  value={newFestivo.descripcion}
                  onChange={e => setNewFestivo(p => ({ ...p, descripcion: e.target.value }))}
                  placeholder={t('descripcion_festivo_hint')}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={handleAddFestivo}
                disabled={addingFestivo || !newFestivo.fecha}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {t('anadir')}
              </button>
            </div>

            {/* Lista */}
            {festivos.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">{t('sin_resultados')}</p>
            ) : (
              <div className="space-y-2">
                {festivos.map(f => (
                  <div key={f.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-white text-sm font-medium">
                          {new Date(f.fecha + 'T00:00:00').toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
            <h2 className="text-lg font-semibold text-white mb-4">{t('facturacion_titulo')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label={t('iva_defecto_label')} hint={t('iva_defecto_hint')}>
                <Input type="number" value={c('iva_defecto')} onChange={v => setC('iva_defecto', v)} />
              </Field>
              <Field label={t('comision_estudio_label')} hint={t('comision_estudio_hint')}>
                <Input type="number" value={c('comision_clientes_estudio')} onChange={v => setC('comision_clientes_estudio', v)} />
              </Field>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="text-white text-sm font-medium">{t('facturas_auto_label')}</p>
                <p className="text-gray-500 text-xs">{t('facturas_auto_hint')}</p>
              </div>
              <Toggle checked={bool('facturas_automaticas')} onChange={() => setC('facturas_automaticas', !bool('facturas_automaticas'))} />
            </div>
            <div className="flex justify-end pt-2">
              <SaveBtn labelSave={t('guardar')} labelSaving={t('guardando')} onClick={() => save(['iva_defecto', 'facturas_automaticas', 'comision_clientes_estudio'])} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Comunicaciones ── */}
        {tab === 'comunicaciones' && (
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white mb-4">{t('comunicaciones_config_titulo')}</h2>
            {[
              { clave: 'dni_obligatorio', label: t('dni_obligatorio_label'), desc: t('dni_obligatorio_desc') },
              { clave: 'enviar_copia_consentimiento_cliente', label: t('copia_cliente_label'), desc: t('copia_cliente_desc') },
              { clave: 'enviar_copia_consentimiento_estudio', label: t('copia_estudio_label'), desc: t('copia_estudio_desc') },
              { clave: 'incluir_enlace_firma_email', label: t('enlace_firma_label'), desc: t('enlace_firma_desc') },
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
              <SaveBtn labelSave={t('guardar')} labelSaving={t('guardando')} onClick={() => save([
                'dni_obligatorio','enviar_copia_consentimiento_cliente',
                'enviar_copia_consentimiento_estudio','incluir_enlace_firma_email',
              ])} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Calendario ── */}
        {tab === 'calendario' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">{t('calendario_config_titulo')}</h2>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="text-white text-sm font-medium">{t('citas_nueva_pestana_label')}</p>
                <p className="text-gray-500 text-xs">{t('citas_nueva_pestana_desc')}</p>
              </div>
              <Toggle checked={bool('citas_nueva_pestana')} onChange={() => setC('citas_nueva_pestana', !bool('citas_nueva_pestana'))} />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="text-white text-sm font-medium">{t('texto_blanco_label')}</p>
                <p className="text-gray-500 text-xs">{t('texto_blanco_desc')}</p>
              </div>
              <Toggle checked={bool('forzar_texto_blanco_calendario')} onChange={() => setC('forzar_texto_blanco_calendario', !bool('forzar_texto_blanco_calendario'))} />
            </div>
            <div className="py-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white text-sm font-medium">{t('intensidad_color_label')}</p>
                  <p className="text-gray-500 text-xs">{t('intensidad_color_desc')}</p>
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
              <SaveBtn labelSave={t('guardar')} labelSaving={t('guardando')} onClick={() => save(['citas_nueva_pestana', 'forzar_texto_blanco_calendario', 'intensidad_color_artistas'])} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Política ── */}
        {tab === 'politica' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">{t('politica_titulo')}</h2>
            <p className="text-sm text-gray-400">Estos textos aparecen en los emails de confirmación de cita y en los consentimientos.</p>
            <Field label={t('texto_politica_cancelacion')}>
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
            <Field label="Política de reembolso">
              <textarea
                value={c('politica_reembolso')}
                onChange={e => setC('politica_reembolso', e.target.value)}
                rows={5}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
                placeholder="Escribe aquí la política de devoluciones y reembolsos de adelantos..."
              />
            </Field>
            <Field label="Política de privacidad">
              <textarea
                value={c('politica_privacidad')}
                onChange={e => setC('politica_privacidad', e.target.value)}
                rows={5}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
                placeholder="Términos sobre la recolección, uso y protección de datos del usuario..."
              />
            </Field>
            <div className="flex justify-end pt-2">
              <SaveBtn labelSave={t('guardar')} labelSaving={t('guardando')} onClick={() => save(['politica_cancelacion', 'info_adicional_clientes', 'politica_reembolso', 'politica_privacidad'])} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Personalización ── */}
        {tab === 'personalizacion' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-800 pb-2">
              {[
                { id: 'panel', key: 'subtab_panel' },
                { id: 'facturas', key: 'subtab_facturas' },
                { id: 'tickets', key: 'subtab_tickets' },
                { id: 'consentimientos', key: 'subtab_consentimientos' },
                { id: 'whatsapp', key: 'subtab_whatsapp' },
                { id: 'correo', key: 'subtab_correo' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setSubTabPersonalizacion(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    subTabPersonalizacion === st.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {t(st.key)}
                </button>
              ))}
            </div>

            {subTabPersonalizacion === 'panel' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-4">{t('person_panel_titulo')}</h2>
                <p className="text-sm text-gray-400 mb-6">{t('person_panel_sub')}</p>
                
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-white mb-3">{t('skins_titulo')}</h3>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { name: 'Indigo', color: '#4f46e5' },
                      { name: 'Pink', color: '#e11d48' },
                      { name: 'Emerald', color: '#10b981' },
                      { name: 'Violet', color: '#8b5cf6' },
                      { name: 'Orange', color: '#f97316' },
                      { name: 'Cyan', color: '#06b6d4' },
                      { name: 'Gold', color: '#d4af37' },
                    ].map(skin => (
                      <button
                        key={skin.name}
                        onClick={() => {
                          setC('theme_primary_color', skin.color);
                          if (changePrimaryColor) changePrimaryColor(skin.color);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          c('theme_primary_color') === skin.color 
                            ? 'border-indigo-500 bg-gray-800' 
                            : 'border-gray-700 bg-gray-900 hover:bg-gray-800'
                        }`}
                        title={skin.name}
                      >
                        <span className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: skin.color }}></span>
                        <span className="text-sm text-gray-300">{skin.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label={t('color_principal')} hint={t('color_principal_hint')}>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={c('theme_primary_color') || '#4f46e5'}
                        onChange={e => {
                          setC('theme_primary_color', e.target.value);
                          if (changePrimaryColor) changePrimaryColor(e.target.value);
                        }}
                        className="w-12 h-12 p-1 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                      />
                      <Input 
                        value={c('theme_primary_color') || '#4f46e5'} 
                        onChange={v => {
                          setC('theme_primary_color', v);
                          if (changePrimaryColor) changePrimaryColor(v);
                        }} 
                        placeholder="#4f46e5" 
                      />
                    </div>
                  </Field>

                  <Field label={t('color_fondo')} hint={t('color_fondo_hint')}>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={c('theme_bg_color') || '#171717'}
                        onChange={e => setC('theme_bg_color', e.target.value)}
                        className="w-12 h-12 p-1 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                      />
                      <Input value={c('theme_bg_color') || '#171717'} onChange={v => setC('theme_bg_color', v)} placeholder="#171717" />
                    </div>
                  </Field>

                  <Field label={t('color_superficie')} hint={t('color_superficie_hint')}>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={c('theme_surface_color') || '#262626'}
                        onChange={e => setC('theme_surface_color', e.target.value)}
                        className="w-12 h-12 p-1 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                      />
                      <Input value={c('theme_surface_color') || '#262626'} onChange={v => setC('theme_surface_color', v)} placeholder="#262626" />
                    </div>
                  </Field>

                  <Field label={t('tipografia')} hint={t('tipografia_hint')}>
                    <select
                      value={c('theme_font_family') || 'Inter, sans-serif'}
                      onChange={e => setC('theme_font_family', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Poppins, sans-serif">Poppins</option>
                      <option value="'Open Sans', sans-serif">Open Sans</option>
                      <option value="Montserrat, sans-serif">Montserrat</option>
                      <option value="monospace">Monospace</option>
                      <option value="'Times New Roman', serif">Times New Roman</option>
                    </select>
                  </Field>

                  <Field label={t('tamano_letra')} hint={t('tamano_letra_hint')}>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="12"
                        max="20"
                        value={parseInt(c('theme_font_size')) || 14}
                        onChange={e => setC('theme_font_size', `${e.target.value}px`)}
                        className="w-full accent-indigo-500"
                      />
                      <span className="text-white text-sm w-12">{c('theme_font_size') || '14px'}</span>
                    </div>
                  </Field>

                  <div className="md:col-span-2 mt-4 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                    <h3 className="text-sm font-medium text-white mb-3">{t('logo_estudio')}</h3>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                        {c('theme_logo_url') ? (
                          <img src={getImagenUrl(c('theme_logo_url'))} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-gray-500 text-xs">{t('sin_logo')}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-2">{t('subir_logo_hint')}</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const fd = new FormData();
                            fd.append('logo', file);
                            setSaving(true);
                            try {
                              const res = await uploadLogo(fd);
                              setC('theme_logo_url', res.data.url);
                              setMsg('Logotipo actualizado.');
                            } catch (err) {
                              alert('Error al subir el logo');
                            } finally {
                              setSaving(false);
                            }
                          }}
                          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-800">
                  <SaveBtn labelSave={t('guardar')} labelSaving={t('guardando')} onClick={async () => {
                    const ok = await save(['theme_primary_color', 'theme_bg_color', 'theme_font_family', 'theme_font_size', 'theme_logo_url']);
                    if (ok) window.location.reload(); 
                  }} saving={saving} />
                </div>
                {msg && <p className="text-indigo-400 text-sm mt-2 text-right">{msg}</p>}
              </div>
            )}

            {subTabPersonalizacion === 'facturas' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-4">{t('person_facturas_titulo')}</h2>
                <p className="text-sm text-gray-400 mb-6">{t('person_facturas_sub')}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label={t('nombre_fiscal')}>
                    <Input value={c('factura_nombre')} onChange={v => setC('factura_nombre', v)} placeholder="Tattoo Studio SL" />
                  </Field>
                  <Field label={t('cif_nif')}>
                    <Input value={c('factura_cif')} onChange={v => setC('factura_cif', v)} placeholder="B12345678" />
                  </Field>
                  <Field label={t('direccion_completa')}>
                    <Input value={c('factura_direccion')} onChange={v => setC('factura_direccion', v)} placeholder="Calle Principal 123" />
                  </Field>
                  <Field label={t('datos_contacto')}>
                    <Input value={c('factura_contactos')} onChange={v => setC('factura_contactos', v)} placeholder="info@tattoostudio.com" />
                  </Field>
                  <Field label={t('anio_fiscal')} hint={t('anio_fiscal_hint')}>
                    <Input value={c('factura_anio_fiscal')} onChange={v => setC('factura_anio_fiscal', v)} placeholder="2026" />
                  </Field>
                  
                  <Field label={t('reiniciar_contador')} hint={t('reiniciar_contador_hint')}>
                    <div className="flex gap-2">
                      <Input type="number" value={nuevaSecuenciaFactura} onChange={setNuevaSecuenciaFactura} placeholder={t('proximo_numero')} />
                      <button onClick={handleResetSecuenciaFactura} disabled={saving || !nuevaSecuenciaFactura} className="px-3 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                        {t('reiniciar')}
                      </button>
                    </div>
                  </Field>

                  <div className="md:col-span-2">
                    <Field label={t('texto_legal_factura')}>
                      <textarea
                        value={c('factura_texto_legal')}
                        onChange={e => setC('factura_texto_legal', e.target.value)}
                        rows={3}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
                        placeholder="Inscrita en el Registro Mercantil..."
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2 mt-2 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                    <h3 className="text-sm font-medium text-white mb-3">{t('logo_factura')}</h3>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-white rounded-lg border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                        {c('factura_logo_url') ? (
                          <img src={getImagenUrl(c('factura_logo_url'))} alt="Logo Factura" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-gray-400 text-xs text-center px-2">{t('logo_factura_general')}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-2">{t('logo_factura_hint')}</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const fd = new FormData();
                            fd.append('logo', file);
                            fd.append('tipo', 'factura_logo_url');
                            setSaving(true);
                            try {
                              const res = await uploadLogo(fd);
                              setC('factura_logo_url', res.data.url);
                              setMsg('Logotipo de factura subido.');
                            } catch (err) {
                              alert('Error al subir el logo');
                            } finally {
                              setSaving(false);
                            }
                          }}
                          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-800">
                  <SaveBtn labelSave={t('guardar')} labelSaving={t('guardando')} onClick={() => save(['factura_nombre', 'factura_cif', 'factura_direccion', 'factura_contactos', 'factura_anio_fiscal', 'factura_texto_legal', 'factura_logo_url'])} saving={saving} />
                </div>
              </div>
            )}

            {subTabPersonalizacion === 'tickets' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-4">{t('person_tickets_titulo')}</h2>
                <p className="text-sm text-gray-400 mb-6">{t('person_tickets_sub')}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 p-4 border border-gray-700 rounded-lg bg-gray-800/50 space-y-4">
                     <h3 className="text-sm font-medium text-white mb-2">{t('diseno_ticket')}</h3>
                     
                     <Field label={t('ticket_encabezado')}>
                       <textarea
                         value={c('ticket_encabezado')}
                         onChange={e => setC('ticket_encabezado', e.target.value)}
                         rows={5}
                         className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
                         placeholder="BLACK BLOOD ART STUDIO..."
                       />
                     </Field>

                     <Field label={t('ticket_pie')}>
                       <textarea
                         value={c('ticket_pie')}
                         onChange={e => setC('ticket_pie', e.target.value)}
                         rows={4}
                         className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
                         placeholder="Gracias por confiar..."
                       />
                     </Field>
                  </div>

                  <Field label={t('prefijo_ticket')}>
                    <Input value={c('ticket_prefijo')} onChange={v => setC('ticket_prefijo', v)} placeholder="TK" />
                  </Field>

                  <Field label={t('longitud_minima')}>
                    <Input type="number" value={c('ticket_long_num')} onChange={v => setC('ticket_long_num', v)} placeholder="3" />
                  </Field>

                  <div className="md:col-span-2 flex flex-col gap-4 mt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5 border-2 border-gray-500 rounded bg-gray-800 group-hover:border-indigo-400 transition-colors">
                        <input
                          type="checkbox"
                          checked={c('ticket_disable_print') === 'true'}
                          onChange={e => setC('ticket_disable_print', e.target.checked ? 'true' : 'false')}
                          className="absolute opacity-0 w-full h-full cursor-pointer"
                        />
                        {c('ticket_disable_print') === 'true' && <svg className="w-3 h-3 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <span className="text-sm font-medium text-gray-300">{t('desactivar_impresion_auto')}</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5 border-2 border-gray-500 rounded bg-gray-800 group-hover:border-indigo-400 transition-colors">
                        <input
                          type="checkbox"
                          checked={c('ticket_enable_email') === 'true'}
                          onChange={e => setC('ticket_enable_email', e.target.checked ? 'true' : 'false')}
                          className="absolute opacity-0 w-full h-full cursor-pointer"
                        />
                        {c('ticket_enable_email') === 'true' && <svg className="w-3 h-3 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <span className="text-sm font-medium text-gray-300">{t('activar_ticket_email')}</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-800">
                  <SaveBtn labelSave={t('guardar')} labelSaving={t('guardando')} onClick={() => save([
                    'ticket_encabezado', 'ticket_pie', 'ticket_prefijo', 'ticket_long_num', 'ticket_disable_print', 'ticket_enable_email'
                  ])} saving={saving} />
                </div>
              </div>
            )}

            {subTabPersonalizacion === 'consentimientos' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">{t('person_consent_titulo')}</h2>
                    <p className="text-sm text-gray-400">{t('person_consent_sub')}</p>
                  </div>
                  <button
                    onClick={() => window.open('/api/consentimiento/preview', '_blank')}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors border border-gray-700 whitespace-nowrap"
                  >
                    {t('ver_vista_previa')}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <Field label={t('instrucciones_curas')} hint={t('instrucciones_curas_hint')}>
                    <textarea
                      value={c('consentimiento_curas')}
                      onChange={e => setC('consentimiento_curas', e.target.value)}
                      rows={5}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
                    />
                  </Field>

                  <Field label={t('cuidados_generales')} hint={t('cuidados_generales_hint')}>
                    <textarea
                      value={c('consentimiento_cuidados')}
                      onChange={e => setC('consentimiento_cuidados', e.target.value)}
                      rows={5}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
                    />
                  </Field>

                  <Field label={t('proteccion_datos_rgpd')} hint={t('proteccion_datos_rgpd_hint')}>
                    <textarea
                      value={c('consentimiento_proteccion_datos')}
                      onChange={e => setC('consentimiento_proteccion_datos', e.target.value)}
                      rows={6}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
                    />
                  </Field>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-800">
                  <SaveBtn labelSave={t('guardar')} labelSaving={t('guardando')} onClick={() => save([
                    'consentimiento_curas', 'consentimiento_cuidados', 'consentimiento_proteccion_datos'
                  ])} saving={saving} />
                </div>
              </div>
            )}

            {subTabPersonalizacion === 'whatsapp' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-4">{t('person_whatsapp_titulo')}</h2>
                <p className="text-sm text-gray-400 mb-6">{t('person_whatsapp_sub')}</p>
                
                <Field label={t('plantilla_whatsapp')}>
                  <textarea
                    value={c('whatsapp_plantilla_cita')}
                    onChange={e => setC('whatsapp_plantilla_cita', e.target.value)}
                    rows={6}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
                  />
                </Field>

                <div className="flex justify-end pt-4 border-t border-gray-800">
                  <SaveBtn labelSave={t('guardar')} labelSaving={t('guardando')} onClick={() => save(['whatsapp_plantilla_cita'])} saving={saving} />
                </div>
              </div>
            )}

            {subTabPersonalizacion === 'correo' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-4">{t('person_correo_titulo')}</h2>
                <p className="text-sm text-gray-400 mb-6">{t('person_correo_sub')}</p>
                
                <div className="grid grid-cols-1 gap-6">
                  <Field label={t('correo_pie_firma')} hint={t('correo_pie_firma_hint')}>
                    <textarea
                      value={c('correo_pie_pagina')}
                      onChange={e => setC('correo_pie_pagina', e.target.value)}
                      rows={4}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
                    />
                  </Field>

                  <Field label={t('correo_aviso_legal')} hint={t('correo_aviso_legal_hint')}>
                    <textarea
                      value={c('correo_proteccion_datos')}
                      onChange={e => setC('correo_proteccion_datos', e.target.value)}
                      rows={5}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
                    />
                  </Field>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-800">
                  <SaveBtn labelSave={t('guardar')} labelSaving={t('guardando')} onClick={() => save(['correo_pie_pagina', 'correo_proteccion_datos'])} saving={saving} />
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
