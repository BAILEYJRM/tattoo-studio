import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPresupuestoPublico } from '../api';

/* ── Vista pública del presupuesto (sin autenticación) ───────────── */
export default function PresupuestoPublic() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getPresupuestoPublico(token);
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Presupuesto no encontrado o enlace inválido.');
        } else if (err.response?.status === 410) {
          setError('Este enlace de presupuesto ha expirado. Contacta con el estudio para solicitar uno nuevo.');
        } else {
          setError('Error al cargar el presupuesto.');
        }
      }
      setLoading(false);
    };
    cargar();
  }, [token]);

  function fmtMoneda(v) {
    if (v == null || v === '') return '—';
    return Number(v).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
  }

  function fmtFecha(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-white text-lg font-semibold mb-2">Enlace no disponible</h2>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 md:p-8">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-gray-800 px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Presupuesto</h1>
              <p className="text-gray-400 text-xs">Tattoo Studio</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-gray-400 mt-3">
            <span>Fecha: {fmtFecha(data.fecha)}</span>
            {data.validez && <span>· Válido hasta: {fmtFecha(data.validez)}</span>}
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 py-6 space-y-6">
          {/* Servicios */}
          {data.servicios && (
            <div>
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Servicios incluidos</h3>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{data.servicios}</p>
            </div>
          )}

          {/* Desglose económico */}
          <div>
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Desglose económico</h3>
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 divide-y divide-gray-700/50">
              {data.sesiones_estimadas && (
                <div className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-gray-400">Sesiones estimadas</span>
                  <span className="text-white">{data.sesiones_estimadas}</span>
                </div>
              )}
              {data.precio_por_sesion && (
                <div className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-gray-400">Precio por sesión</span>
                  <span className="text-white">{fmtMoneda(data.precio_por_sesion)}</span>
                </div>
              )}
              {data.horas_estimadas && (
                <div className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-gray-400">Horas estimadas</span>
                  <span className="text-white">{data.horas_estimadas}h</span>
                </div>
              )}
              {data.precio_fijo && (
                <div className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-gray-400">Precio fijo</span>
                  <span className="text-white">{fmtMoneda(data.precio_fijo)}</span>
                </div>
              )}
              {Number(data.descuento) > 0 && (
                <div className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-gray-400">Descuento</span>
                  <span className="text-green-400">-{data.descuento}%</span>
                </div>
              )}
              {Number(data.impuesto) > 0 && (
                <div className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-gray-400">IVA</span>
                  <span className="text-white">{data.impuesto}%</span>
                </div>
              )}
              {data.deposito_requerido && (
                <div className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-gray-400">Depósito requerido</span>
                  <span className="text-yellow-400 font-medium">{fmtMoneda(data.deposito_requerido)}</span>
                </div>
              )}
              {/* Total */}
              <div className="flex justify-between px-4 py-4 bg-indigo-500/5">
                <span className="text-white font-semibold">Total estimado</span>
                <span className="text-white font-bold text-lg">{fmtMoneda(data.total_estimado)}</span>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {data.observaciones && (
            <div>
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Observaciones</h3>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{data.observaciones}</p>
            </div>
          )}

          {/* Condiciones */}
          {data.condiciones && (
            <div>
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Condiciones</h3>
              <p className="text-gray-400 text-xs whitespace-pre-wrap">{data.condiciones}</p>
            </div>
          )}

          {/* Política de cancelación */}
          {data.politica_cancelacion && (
            <div>
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Política de cancelación</h3>
              <p className="text-gray-400 text-xs whitespace-pre-wrap">{data.politica_cancelacion}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800/30 border-t border-gray-800 px-6 py-4 text-center">
          <p className="text-gray-600 text-xs">
            Este presupuesto ha sido generado automáticamente. Para cualquier consulta, contacta directamente con el estudio.
          </p>
        </div>
      </div>
    </div>
  );
}
