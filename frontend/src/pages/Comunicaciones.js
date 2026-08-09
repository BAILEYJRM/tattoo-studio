import React, { useState, useEffect, useCallback } from 'react';
import {
  getComunicaciones, getPlantillasComunicacion, updatePlantillaComunicacion,
  getEstadisticasComunicaciones, getPlantillas as getPlantillasConsentimiento, updatePlantilla as updatePlantillaConsentimiento
} from '../api';
import Modal from '../components/Modal';

const TIPO_LABELS = {
  confirmacion_cita: 'Confirmación cita',
  recordatorio_cita: 'Recordatorio cita',
  cuidados_tatuaje: 'Cuidados tatuaje',
  cuidados_piercing: 'Cuidados piercing',
  cumpleanos: 'Cumpleaños',
  consentimiento_firmado: 'Consentimiento',
  interes_curacion_tatuaje: 'Interés curación tatuaje',
  interes_curacion_piercing: 'Interés curación piercing',
  recordatorio_whatsapp: 'Recordatorio Whatsapp'
};

const VARIABLES_POR_TIPO = {
  confirmacion_cita: ['cliente_nombre','fecha','hora_inicio','hora_fin','artista_nombre','cabina_nombre','precio','politica_cancelacion','estudio'],
  recordatorio_cita: ['cliente_nombre','fecha','hora_inicio','artista_nombre','estudio'],
  cuidados_tatuaje: ['cliente_nombre','estudio'],
  cuidados_piercing: ['cliente_nombre','estudio'],
  cumpleanos: ['cliente_nombre','estudio'],
  consentimiento_firmado: ['cliente_nombre','fecha','estudio'],
  interes_curacion_tatuaje: ['cliente_nombre','estudio'],
  interes_curacion_piercing: ['cliente_nombre','estudio'],
  recordatorio_whatsapp: ['cliente_nombre','fecha','hora_inicio','artista_nombre','estudio']
};

function EstadoBadge({ estado }) {
  const ok = estado === 'enviado';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
      ok ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-400' : 'bg-red-400'}`} />
      {ok ? 'Enviado' : 'Error'}
    </span>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange} className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-600'}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-white'}`}>{value}</p>
    </div>
  );
}

// ── Pestaña Historial ─────────────────────────────────────────────────────────
function TabHistorial() {
  const [comunicaciones, setComunicaciones] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtroTipo) params.tipo = filtroTipo;
      if (filtroEstado) params.estado = filtroEstado;
      const [comRes, statsRes] = await Promise.all([
        getComunicaciones(params),
        getEstadisticasComunicaciones(),
      ]);
      setComunicaciones(comRes.data);
      setStats(statsRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filtroTipo, filtroEstado]);

  useEffect(() => { cargar(); }, [cargar]);

  const fmtFecha = (d) => d ? new Date(d).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="space-y-5">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Enviados hoy" value={stats.enviados_hoy} />
          <StatCard label="Esta semana" value={stats.enviados_semana} />
          <StatCard label="Este mes" value={stats.enviados_mes} />
          <StatCard label="Tasa de éxito" value={`${stats.tasa_exito}%`} color="text-green-400" />
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
          className="bg-gray-900 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Todos los tipos</option>
          {Object.entries(TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
          className="bg-gray-900 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Todos los estados</option>
          <option value="enviado">Enviado</option>
          <option value="error">Error</option>
          <option value="pendiente">Pendiente</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Cargando...</div>
        ) : comunicaciones.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No hay comunicaciones registradas</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Fecha','Tipo','Destinatario','Asunto','Estado'].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comunicaciones.map((c) => (
                  <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{fmtFecha(c.enviado_en || c.created_at)}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{TIPO_LABELS[c.tipo] || c.tipo}</span>
                    </td>
                    <td className="px-4 py-2.5 text-white">{c.destinatario}</td>
                    <td className="px-4 py-2.5 text-gray-400 max-w-[220px] truncate">{c.asunto}</td>
                    <td className="px-4 py-2.5"><EstadoBadge estado={c.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pestaña Plantillas ────────────────────────────────────────────────────────
function TabPlantillas() {
  const [plantillas, setPlantillas] = useState([]);
  const [plantillasCons, setPlantillasCons] = useState([]);
  
  const [editando, setEditando] = useState(null); // plantilla o cons editando
  const [tipoEditando, setTipoEditando] = useState(''); // 'comunicacion' | 'consentimiento'
  const [form, setForm] = useState({ asunto: '', contenido: '', activa: true });
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getPlantillasComunicacion().then((r) => setPlantillas(r.data)).catch(console.error);
    getPlantillasConsentimiento().then((r) => setPlantillasCons(r.data)).catch(console.error);
  }, []);

  const toggleActiva = async (p, tipoStr) => {
    try {
      if (tipoStr === 'comunicacion') {
        const res = await updatePlantillaComunicacion(p.id, { ...p, activa: !p.activa });
        setPlantillas(prev => prev.map(x => x.id === p.id ? res.data : x));
      } else {
        const res = await updatePlantillaConsentimiento(p.id, { ...p, activo: !p.activo });
        setPlantillasCons(prev => prev.map(x => x.id === p.id ? res.data : x));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const abrirEditor = (p, tipoStr) => {
    setEditando(p);
    setTipoEditando(tipoStr);
    setForm({ 
      asunto: p.asunto || '', 
      contenido: p.contenido || '', 
      activa: tipoStr === 'comunicacion' ? p.activa : p.activo 
    });
    setModalOpen(true);
  };

  const insertarVariable = (v) => {
    setForm((f) => ({ ...f, contenido: f.contenido + `{{${v}}}` }));
  };

  const guardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (tipoEditando === 'comunicacion') {
        const res = await updatePlantillaComunicacion(editando.id, form);
        setPlantillas((prev) => prev.map((p) => p.id === editando.id ? res.data : p));
      } else {
        const payload = { 
          nombre: editando.nombre, 
          tipo: editando.tipo, 
          contenido: form.contenido, 
          activo: form.activa 
        };
        const res = await updatePlantillaConsentimiento(editando.id, payload);
        setPlantillasCons((prev) => prev.map((p) => p.id === editando.id ? res.data : p));
      }
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const findCom = (t) => plantillas.find(p => p.tipo === t) || { tipo: t, activa: false };
  const findCons = (t) => plantillasCons.find(p => p.tipo === t) || { tipo: t, nombre: t, activo: false };

  const cuidadosTatuaje = findCom('cuidados_tatuaje');
  const cuidadosPiercing = findCom('cuidados_piercing');
  const interesTatuaje = findCom('interes_curacion_tatuaje');
  const interesPiercing = findCom('interes_curacion_piercing');
  const cumpleanos = findCom('cumpleanos');
  const whatsapp = findCom('recordatorio_whatsapp');
  
  const consTatuaje = findCons('tatuaje');
  const consPiercing = findCons('piercing');

  return (
    <div className="space-y-10 pb-10">
      
      {/* SECCION SUPERIOR (Cuidados, Interés, Consentimientos) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* Email de cuidados posteriores */}
        <div className="bg-[#1C1F26] rounded-2xl p-6 border border-gray-800/60 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
             <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
             </div>
             <div>
               <h3 className="text-white font-semibold text-lg">Email de cuidados posteriores</h3>
               <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                 Tras cada servicio, tu estudio envía automáticamente a tus clientes un email con los <strong className="text-gray-300 font-medium">consejos y cuidados recomendados</strong>. Puedes personalizar el contenido del email y adaptar la información a tu gusto.
               </p>
             </div>
          </div>
          
          <table className="w-full text-left text-sm text-gray-300 mt-6 pl-14 block">
            <thead className="w-full table table-fixed">
              <tr className="border-b border-gray-800">
                <th className="py-2 font-medium text-gray-500">Servicio</th>
                <th className="py-2 font-medium text-gray-500 text-center">Editar email</th>
                <th className="py-2 font-medium text-gray-500 text-right pr-4">Activo</th>
              </tr>
            </thead>
            <tbody className="w-full table table-fixed">
              <tr className="border-b border-gray-800/50">
                <td className="py-4">Tatuaje</td>
                <td className="py-4 text-center"><button onClick={() => abrirEditor(cuidadosTatuaje, 'comunicacion')} className="text-indigo-400 hover:text-indigo-300 inline-block"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button></td>
                <td className="py-4"><div className="flex justify-end pr-4"><Toggle checked={cuidadosTatuaje.activa} onChange={() => toggleActiva(cuidadosTatuaje, 'comunicacion')} /></div></td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-4">Piercing</td>
                <td className="py-4 text-center"><button onClick={() => abrirEditor(cuidadosPiercing, 'comunicacion')} className="text-indigo-400 hover:text-indigo-300 inline-block"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button></td>
                <td className="py-4"><div className="flex justify-end pr-4"><Toggle checked={cuidadosPiercing.activa} onChange={() => toggleActiva(cuidadosPiercing, 'comunicacion')} /></div></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Email de interés por la curación */}
        <div className="bg-[#1C1F26] rounded-2xl p-6 border border-gray-800/60 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
             <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
             </div>
             <div>
               <h3 className="text-white font-semibold text-lg">Email de interés por la curación</h3>
               <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                 Tras un periodo definido, tu estudio enviará automáticamente a tus clientes un email interesándose por su estado. Ofreciendo así una mayor calidad de servicio 'post-venta'.
               </p>
             </div>
          </div>
          
          <table className="w-full text-left text-sm text-gray-300 mt-6 pl-14 block">
            <thead className="w-full table table-fixed">
              <tr className="border-b border-gray-800">
                <th className="py-2 font-medium text-gray-500">Servicio</th>
                <th className="py-2 font-medium text-gray-500 text-center">Editar email</th>
                <th className="py-2 font-medium text-gray-500 text-right pr-4">Activo</th>
              </tr>
            </thead>
            <tbody className="w-full table table-fixed">
              <tr className="border-b border-gray-800/50">
                <td className="py-4">Tatuaje</td>
                <td className="py-4 text-center"><button onClick={() => abrirEditor(interesTatuaje, 'comunicacion')} className="text-indigo-400 hover:text-indigo-300 inline-block"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button></td>
                <td className="py-4"><div className="flex justify-end pr-4"><Toggle checked={interesTatuaje.activa} onChange={() => toggleActiva(interesTatuaje, 'comunicacion')} /></div></td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-4">Piercing</td>
                <td className="py-4 text-center"><button onClick={() => abrirEditor(interesPiercing, 'comunicacion')} className="text-indigo-400 hover:text-indigo-300 inline-block"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button></td>
                <td className="py-4"><div className="flex justify-end pr-4"><Toggle checked={interesPiercing.activa} onChange={() => toggleActiva(interesPiercing, 'comunicacion')} /></div></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Personalización de consentimientos */}
        <div className="xl:col-span-2 mt-4 bg-[#1C1F26] rounded-2xl p-6 border border-gray-800/60 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
             <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             </div>
             <div className="max-w-2xl">
               <h3 className="text-white font-semibold text-lg">Personalización de consentimientos informados</h3>
               <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                 Adapta a tu gusto los apartados "Contraindicaciones", "Riesgos", "Indicaciones previas" y "Cuidados posteriores" de los consentimientos informados que genera tu estudio.
               </p>
             </div>
          </div>
          
          <table className="w-full xl:w-1/2 text-left text-sm text-gray-300 mt-6 pl-14 block">
            <thead className="w-full table table-fixed">
              <tr className="border-b border-gray-800">
                <th className="py-2 font-medium text-gray-500">Servicio</th>
                <th className="py-2 font-medium text-gray-500 text-center">Editar</th>
                <th className="py-2 font-medium text-gray-500 text-right pr-4">Modelo</th>
              </tr>
            </thead>
            <tbody className="w-full table table-fixed">
              <tr className="border-b border-gray-800/50">
                <td className="py-4">Tatuaje</td>
                <td className="py-4 text-center"><button onClick={() => abrirEditor(consTatuaje, 'consentimiento')} className="text-indigo-400 hover:text-indigo-300 inline-block"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button></td>
                <td className="py-4 text-right pr-4"><span className="text-xs text-gray-500">PDF</span></td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-4">Piercing</td>
                <td className="py-4 text-center"><button onClick={() => abrirEditor(consPiercing, 'consentimiento')} className="text-indigo-400 hover:text-indigo-300 inline-block"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button></td>
                <td className="py-4 text-right pr-4"><span className="text-xs text-gray-500">PDF</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCION INFERIOR (Cajas Oscuras: Cumpleaños, Recordatorio Whatsapp) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* Cumpleaños */}
        <div className="bg-[#1C1F26] rounded-2xl p-6 border border-gray-800/60 shadow-lg">
          <div className="flex items-start gap-4">
             <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-900 shrink-0">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" /></svg>
             </div>
             <div className="flex-1">
               <h3 className="text-white font-semibold text-lg">Cumpleaños</h3>
               <p className="text-gray-300 text-sm mt-1">
                 Inkoru puede enviar automáticamente un email a todos tus clientes que cumplan años. Recuerda que puedes editar el asunto y el contenido del email.
               </p>
               
               <table className="w-full text-left text-sm text-gray-300 mt-6 block">
                 <thead className="w-full table table-fixed">
                   <tr className="border-b border-gray-700">
                     <th className="py-2 font-medium text-white">Comunicación</th>
                     <th className="py-2 font-medium text-white text-center">Editar email</th>
                     <th className="py-2 font-medium text-white text-right pr-2">Activo</th>
                   </tr>
                 </thead>
                 <tbody className="w-full table table-fixed">
                   <tr className="border-b border-gray-700/50">
                     <td className="py-4 font-medium text-white">Felicitación</td>
                     <td className="py-4 text-center">
                       <button onClick={() => abrirEditor(cumpleanos, 'comunicacion')} className="text-indigo-400 hover:text-indigo-300 inline-block">
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                       </button>
                     </td>
                     <td className="py-4">
                       <div className="flex justify-end pr-2">
                         <Toggle checked={cumpleanos.activa} onChange={() => toggleActiva(cumpleanos, 'comunicacion')} />
                       </div>
                     </td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Whatsapp */}
        <div className="bg-[#1C1F26] rounded-2xl p-6 border border-gray-800/60 shadow-lg">
          <div className="flex items-start gap-4">
             <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-900 shrink-0">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             </div>
             <div className="flex-1">
               <h3 className="text-white font-semibold text-lg">Recordatorio Whatsapp</h3>
               <p className="text-gray-300 text-sm mt-1">
                 Personaliza el mensaje que envías manualmente a cada cliente para recordarle su cita.
               </p>
               
               <table className="w-full text-left text-sm text-gray-300 mt-6 block">
                 <thead className="w-full table table-fixed">
                   <tr className="border-b border-gray-700">
                     <th className="py-2 font-medium text-white">Comunicación</th>
                     <th className="py-2 font-medium text-white text-center">Editar mensaje</th>
                     <th className="py-2 font-medium text-white text-right pr-2">Activo</th>
                   </tr>
                 </thead>
                 <tbody className="w-full table table-fixed">
                   <tr className="border-b border-gray-700/50">
                     <td className="py-4 font-medium text-white">Recordatorio</td>
                     <td className="py-4 text-center">
                       <button onClick={() => abrirEditor(whatsapp, 'comunicacion')} className="text-indigo-400 hover:text-indigo-300 inline-block">
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                       </button>
                     </td>
                     <td className="py-4">
                       <div className="flex justify-end pr-2">
                         <Toggle checked={whatsapp.activa} onChange={() => toggleActiva(whatsapp, 'comunicacion')} />
                       </div>
                     </td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>
        </div>

      </div>

      {/* Editor Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editando ? (TIPO_LABELS[editando.tipo] || editando.tipo || editando.nombre) : 'Editar'}>
        <form onSubmit={guardar} className="space-y-4">
          
          {(tipoEditando === 'comunicacion' && editando?.tipo !== 'recordatorio_whatsapp') && (
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Asunto</label>
              <input type="text" value={form.asunto} onChange={(e) => setForm({ ...form, asunto: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Contenido</label>
            <textarea
              value={form.contenido}
              onChange={(e) => setForm({ ...form, contenido: e.target.value })}
              rows={12}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono resize-none"
            />
          </div>

          {tipoEditando === 'comunicacion' && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Variables disponibles (clic para insertar):</p>
              <div className="flex flex-wrap gap-1.5">
                {(VARIABLES_POR_TIPO[editando?.tipo] || []).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertarVariable(v)}
                    className="text-xs bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full hover:bg-indigo-600/40 transition-colors font-mono"
                  >
                    {`{{${v}}}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Comunicaciones() {
  const [tab, setTab] = useState('historial');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Comunicaciones</h1>
        <p className="text-gray-400 text-sm mt-0.5">Emails automáticos y plantillas editables</p>
      </div>

      <div className="flex gap-1 bg-gray-900 p-1 rounded-lg w-fit">
        {[['historial','Historial'],['plantillas','Plantillas']].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === k ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'historial' ? <TabHistorial /> : <TabPlantillas />}
    </div>
  );
}
