import React, { useEffect, useState } from 'react';
import { getConfiguracionPublica, getImagenUrl } from '../api';

export default function PresupuestoImprimible({ presupuesto, cliente, proyecto, onClose }) {
  const [config, setConfig] = useState({});

  useEffect(() => {
    getConfiguracionPublica().then(res => setConfig(res.data)).catch(console.error);

    const timer = setTimeout(() => {
      window.print();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (!presupuesto) return null;

  function fmtMoneda(v) {
    if (v == null || v === '') return '—';
    return Number(v).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
  }

  function fmtFecha(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  return (
    <div className="fixed inset-0 bg-gray-500 z-[9999] overflow-y-auto print:bg-white p-8">
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white text-black p-10 shadow-2xl print:shadow-none print:p-0 print:m-0 print:max-w-full flex flex-col justify-between">
        <div>
          {/* Cabecera */}
          <div className="flex justify-between items-start mb-12 border-b border-gray-200 pb-8">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter">PRESUPUESTO</h1>
              <p className="text-gray-500 mt-2 font-medium">#{String(presupuesto.id).padStart(4, '0')}</p>
              <p className="text-gray-500 font-medium">Fecha: {fmtFecha(presupuesto.fecha)}</p>
              {presupuesto.validez && <p className="text-gray-500 font-medium">Válido hasta: {fmtFecha(presupuesto.validez)}</p>}
            </div>
            <div className="text-right flex flex-col items-end">
              {(config.factura_logo_url || config.theme_logo_url) && (
                <img src={getImagenUrl(config.factura_logo_url || config.theme_logo_url)} alt="Logo" className="max-h-16 mb-2 object-contain" />
              )}
              <h2 className="text-xl font-bold text-gray-900">{config.factura_nombre || 'TATTOO STUDIO'}</h2>
              {config.factura_direccion && <p className="text-gray-600 text-sm">{config.factura_direccion}</p>}
              <p className="text-gray-600 text-sm">CIF: {config.factura_cif || 'B12345678'}</p>
            </div>
          </div>

          {/* Datos del Cliente y Proyecto */}
          <div className="grid grid-cols-2 gap-6 mb-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Presupuesto para</h3>
              <p className="text-lg font-bold text-gray-900">{cliente ? `${cliente.nombre} ${cliente.apellidos || ''}` : 'Cliente / Particular'}</p>
              {cliente?.email && <p className="text-gray-600 text-sm">Email: {cliente.email}</p>}
              {cliente?.telefono && <p className="text-gray-600 text-sm">Tel: {cliente.telefono}</p>}
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Proyecto</h3>
              <p className="text-lg font-bold text-gray-900">{proyecto?.nombre || 'Diseño de Tatuaje'}</p>
              {proyecto?.estilo && <p className="text-gray-600 text-sm">Estilo: {proyecto.estilo}</p>}
              {proyecto?.zona_corporal && <p className="text-gray-600 text-sm">Zona: {proyecto.zona_corporal}</p>}
            </div>
          </div>

          {/* Servicios incluidos */}
          {presupuesto.servicios && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Servicios incluidos</h3>
              <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{presupuesto.servicios}</p>
            </div>
          )}

          {/* Desglose Económico */}
          <div className="mb-12">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Desglose económico</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-900 text-sm">
                  <th className="text-left py-3 font-bold text-gray-900">Concepto / Detalle</th>
                  <th className="text-right py-3 font-bold text-gray-900">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {presupuesto.sesiones_estimadas && (
                  <tr>
                    <td className="py-3 text-gray-700">Sesiones estimadas</td>
                    <td className="py-3 text-right text-gray-900">{presupuesto.sesiones_estimadas}</td>
                  </tr>
                )}
                {presupuesto.precio_por_sesion && (
                  <tr>
                    <td className="py-3 text-gray-700">Precio por sesión</td>
                    <td className="py-3 text-right text-gray-900">{fmtMoneda(presupuesto.precio_por_sesion)}</td>
                  </tr>
                )}
                {presupuesto.horas_estimadas && (
                  <tr>
                    <td className="py-3 text-gray-700">Horas estimadas</td>
                    <td className="py-3 text-right text-gray-900">{presupuesto.horas_estimadas}h</td>
                  </tr>
                )}
                {presupuesto.precio_fijo && (
                  <tr>
                    <td className="py-3 text-gray-700">Precio fijo</td>
                    <td className="py-3 text-right text-gray-900">{fmtMoneda(presupuesto.precio_fijo)}</td>
                  </tr>
                )}
                {Number(presupuesto.descuento) > 0 && (
                  <tr>
                    <td className="py-3 text-gray-700">Descuento aplicado</td>
                    <td className="py-3 text-right text-green-600">-{presupuesto.descuento}%</td>
                  </tr>
                )}
                {Number(presupuesto.impuesto) > 0 && (
                  <tr>
                    <td className="py-3 text-gray-700">IVA Aplicado</td>
                    <td className="py-3 text-right text-gray-900">{presupuesto.impuesto}%</td>
                  </tr>
                )}
                {presupuesto.deposito_requerido && (
                  <tr>
                    <td className="py-3 text-gray-700 font-medium">Depósito requerido (Reserva)</td>
                    <td className="py-3 text-right text-gray-900 font-medium">{fmtMoneda(presupuesto.deposito_requerido)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Total */}
            <div className="flex justify-end mt-6 border-t-2 border-gray-900 pt-4">
              <div className="text-right">
                <span className="text-sm font-bold text-gray-500 block uppercase">Total Estimado</span>
                <span className="text-3xl font-black text-gray-900">{fmtMoneda(presupuesto.total_estimado)}</span>
              </div>
            </div>
          </div>

          {/* Condiciones y política */}
          {(presupuesto.condiciones || presupuesto.politica_cancelacion) && (
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200 text-xs text-gray-600">
              {presupuesto.condiciones && (
                <div>
                  <h4 className="font-bold text-gray-800 uppercase mb-1">Condiciones</h4>
                  <p className="whitespace-pre-wrap">{presupuesto.condiciones}</p>
                </div>
              )}
              {presupuesto.politica_cancelacion && (
                <div>
                  <h4 className="font-bold text-gray-800 uppercase mb-1">Política de cancelación</h4>
                  <p className="whitespace-pre-wrap">{presupuesto.politica_cancelacion}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>{config.factura_texto_legal || 'Presupuesto emitido electrónicamente por Tattoo Studio. Válido por el periodo indicado.'}</p>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 text-center print:hidden flex justify-center gap-4">
          <button onClick={() => window.print()} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors">
            Imprimir / Guardar PDF
          </button>
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg shadow transition-colors">
            Cerrar
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .fixed.inset-0, .fixed.inset-0 * {
            visibility: visible;
          }
          .fixed.inset-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: white !important;
            padding: 0 !important;
          }
        }
      `}} />
    </div>
  );
}
