import React, { useState, useEffect, useCallback } from 'react';
import { getRecibos, getClientes, getEmpleados, getCitas, createRecibo, crearFactura, getPdfUrl } from '../../api';
import Modal from '../../components/Modal';

const FORMAS_PAGO = ['efectivo', 'tarjeta', 'bizum', 'transferencia'];

const emptyForm = {
  cita_id: '', cliente_id: '', artista_id: '',
  fecha: new Date().toISOString().split('T')[0],
  concepto: '', subtotal: '', iva_porcentaje: '0',
  forma_pago: 'efectivo',
};

function calcTotal(subtotal, ivaPct) {
  const sub = Number(subtotal || 0);
  const iva = sub * Number(ivaPct || 0) / 100;
  return { iva_importe: iva.toFixed(2), total: (sub + iva).toFixed(2) };
}

export default function Recibos() {
  const [recibos, setRecibos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('mes'); // hoy|semana|mes|todo
  const [buscar, setBuscar] = useState('');

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [generandoFactura, setGenerandoFactura] = useState(null);

  const getRangoFiltro = useCallback(() => {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    if (filtro === 'hoy') return { fecha_inicio: hoyStr, fecha_fin: hoyStr };
    if (filtro === 'semana') {
      const lun = new Date(hoy);
      lun.setDate(hoy.getDate() - (hoy.getDay() === 0 ? 6 : hoy.getDay() - 1));
      return { fecha_inicio: lun.toISOString().split('T')[0], fecha_fin: hoyStr };
    }
    if (filtro === 'mes') {
      const ini = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
      return { fecha_inicio: ini, fecha_fin: hoyStr };
    }
    return {};
  }, [filtro]);

  const fetchRecibos = useCallback(async () => {
    setLoading(true);
    try {
      const params = getRangoFiltro();
      const res = await getRecibos(params);
      setRecibos(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [getRangoFiltro]);

  useEffect(() => { fetchRecibos(); }, [fetchRecibos]);

  useEffect(() => {
    Promise.all([getClientes(), getEmpleados(), getCitas()])
      .then(([cl, emp, cit]) => {
        setClientes(cl.data);
        setEmpleados(emp.data);
        setCitas(cit.data.filter(c => ['confirmada','completada'].includes(c.estado)));
      }).catch(console.error);
  }, []);

  // Al seleccionar cita, autorellenar
  const onCitaChange = (citaId) => {
    const cita = citas.find(c => String(c.id) === String(citaId));
    if (cita) {
      setForm((f) => ({
        ...f,
        cita_id: citaId,
        cliente_id: cita.cliente_id || '',
        artista_id: cita.artista_id || '',
        fecha: cita.fecha?.split('T')[0] || f.fecha,
        concepto: cita.descripcion || '',
        subtotal: cita.precio || '',
        forma_pago: cita.forma_pago || 'efectivo',
      }));
    } else {
      setForm((f) => ({ ...f, cita_id: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { iva_importe, total } = calcTotal(form.subtotal, form.iva_porcentaje);
      await createRecibo({
        ...form,
        cita_id: form.cita_id || null,
        cliente_id: form.cliente_id || null,
        artista_id: form.artista_id || null,
        subtotal: Number(form.subtotal),
        iva_porcentaje: Number(form.iva_porcentaje),
        iva_importe: Number(iva_importe),
        total: Number(total),
      });
      setModal(false);
      setForm(emptyForm);
      fetchRecibos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleGenerarFactura = async (recibo) => {
    setGenerandoFactura(recibo.id);
    try {
      await crearFactura({ recibo_id: recibo.id });
      alert(`Factura generada correctamente`);
    } catch (e) {
      alert('Error al generar factura: ' + (e.response?.data?.error || e.message));
    } finally { setGenerandoFactura(null); }
  };

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const { iva_importe, total } = calcTotal(form.subtotal, form.iva_porcentaje);

  const recibosFiltrados = recibos.filter((r) => {
    if (!buscar) return true;
    const q = buscar.toLowerCase();
    return r.numero?.toLowerCase().includes(q) ||
      r.cliente_nombre?.toLowerCase().includes(q) ||
      r.concepto?.toLowerCase().includes(q);
  });

  const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-ES') : '';
  const fmtFp = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', bizum: 'Bizum', transferencia: 'Trans.' };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Recibos</h1>
          <p className="text-gray-400 text-sm mt-0.5">Justificantes de pago</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setError(''); setModal(true); }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo recibo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-900 p-1 rounded-lg">
          {[['hoy','Hoy'],['semana','Semana'],['mes','Mes'],['todo','Todo']].map(([v,l]) => (
            <button key={v} onClick={() => setFiltro(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filtro === v ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={buscar} onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por número, cliente o concepto..."
            className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500" />
        </div>
      </div>

      {/* Lista */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Cargando...</div>
        ) : recibosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No hay recibos</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Nº Recibo','Fecha','Cliente','Concepto','Total','F. Pago','PDF',''].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recibosFiltrados.map((r) => (
                  <tr key={r.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-indigo-400 font-medium font-mono text-xs">{r.numero}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{fmtDate(r.fecha?.split('T')[0])}</td>
                    <td className="px-4 py-3 text-white">{r.cliente_nombre || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-[180px] truncate">{r.concepto || '—'}</td>
                    <td className="px-4 py-3 text-white font-medium">{Number(r.total || 0).toFixed(2)} €</td>
                    <td className="px-4 py-3 text-gray-400">{fmtFp[r.forma_pago] || r.forma_pago || '—'}</td>
                    <td className="px-4 py-3">
                      {r.pdf_path ? (
                        <a href={`http://localhost:3000/${r.pdf_path}`} target="_blank" rel="noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors">Ver PDF</a>
                      ) : <span className="text-gray-600 text-xs">Sin PDF</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleGenerarFactura(r)} disabled={generandoFactura === r.id}
                        className="text-gray-400 hover:text-purple-400 text-xs transition-colors disabled:opacity-50">
                        {generandoFactura === r.id ? 'Generando...' : '+ Factura'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal nuevo recibo */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Nuevo recibo">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Vincular a cita existente (opcional)</label>
            <select value={form.cita_id} onChange={(e) => onCitaChange(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Sin cita vinculada</option>
              {citas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fecha?.split('T')[0]} — {c.cliente_nombre} ({c.descripcion?.slice(0,30) || 'Sin descripción'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Cliente</label>
              <select value={form.cliente_id} onChange={(e) => setF('cliente_id', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Sin cliente</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre} {c.apellidos}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Artista</label>
              <select value={form.artista_id} onChange={(e) => setF('artista_id', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Sin artista</option>
                {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre} {e.apellidos}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Fecha *</label>
              <input required type="date" value={form.fecha} onChange={(e) => setF('fecha', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Forma de pago</label>
              <select value={form.forma_pago} onChange={(e) => setF('forma_pago', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                {FORMAS_PAGO.map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Concepto *</label>
            <input required value={form.concepto} onChange={(e) => setF('concepto', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Descripción del servicio..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Subtotal (€) *</label>
              <input required type="number" step="0.01" min="0" value={form.subtotal}
                onChange={(e) => setF('subtotal', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">IVA (%)</label>
              <input type="number" step="0.01" min="0" max="100" value={form.iva_porcentaje}
                onChange={(e) => setF('iva_porcentaje', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                placeholder="0" />
            </div>
          </div>

          {/* Preview total */}
          {Number(form.subtotal) > 0 && (
            <div className="bg-gray-700/50 rounded-lg px-4 py-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{Number(form.subtotal).toFixed(2)} €</span></div>
              <div className="flex justify-between text-gray-400"><span>IVA ({form.iva_porcentaje}%)</span><span>{iva_importe} €</span></div>
              <div className="flex justify-between text-white font-bold border-t border-gray-600 pt-1 mt-1"><span>TOTAL</span><span>{total} €</span></div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
              {saving ? 'Guardando...' : 'Crear recibo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
