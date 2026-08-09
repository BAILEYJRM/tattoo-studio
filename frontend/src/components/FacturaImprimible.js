import React, { useEffect } from 'react';

export default function FacturaImprimible({ venta, onClose }) {
  useEffect(() => {
    // Retrasar la impresión un momento para asegurar que el DOM está listo
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!venta) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 z-[9999] overflow-y-auto print:bg-white p-8">
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white text-black p-10 shadow-2xl print:shadow-none print:p-0 print:m-0 print:max-w-full">
        {/* Cabecera */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">FACTURA</h1>
            <p className="text-gray-500 mt-2 font-medium">#{venta.id.toString().padStart(6, '0')}</p>
            <p className="text-gray-500 font-medium">Fecha: {new Date(venta.fecha).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900">TATTOO STUDIO</h2>
            <p className="text-gray-600 mt-1">Calle Principal, 123</p>
            <p className="text-gray-600">28001 Madrid, España</p>
            <p className="text-gray-600">CIF: B12345678</p>
            <p className="text-gray-600">Tel: 91 234 56 78</p>
            <p className="text-gray-600">info@tattoostudio.com</p>
          </div>
        </div>

        {/* Datos del Cliente */}
        <div className="mb-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Facturar a</h3>
          {venta.cliente_nombre ? (
            <div>
              <p className="text-lg font-bold text-gray-900">{venta.cliente_nombre}</p>
              {venta.cliente_documento && <p className="text-gray-600 mt-1">NIF/DNI: {venta.cliente_documento}</p>}
              {venta.cliente_email && <p className="text-gray-600">Email: {venta.cliente_email}</p>}
            </div>
          ) : (
            <p className="text-gray-500 italic">Cliente General / Consumidor Final</p>
          )}
        </div>

        {/* Tabla de Conceptos */}
        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-gray-900 text-sm">
              <th className="text-left py-3 font-bold text-gray-900">Concepto</th>
              <th className="text-center py-3 font-bold text-gray-900">Cant.</th>
              <th className="text-right py-3 font-bold text-gray-900">Precio Unit.</th>
              <th className="text-right py-3 font-bold text-gray-900">Dto.</th>
              <th className="text-right py-3 font-bold text-gray-900">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {venta.lineas?.map((l, i) => (
              <tr key={i}>
                <td className="py-4">
                  <p className="font-medium text-gray-900">{l.descripcion}</p>
                  <p className="text-xs text-gray-500">IVA Aplicado: {l.impuesto_porcentaje}% (Incluido)</p>
                </td>
                <td className="py-4 text-center text-gray-700">{l.cantidad}</td>
                <td className="py-4 text-right text-gray-700">{Number(l.precio_unitario).toFixed(2)} €</td>
                <td className="py-4 text-right text-gray-700">{Number(l.descuento_porcentaje) > 0 ? `${l.descuento_porcentaje}%` : '-'}</td>
                <td className="py-4 text-right font-medium text-gray-900">{Number(l.subtotal).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Resumen Financiero */}
        <div className="flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Base Imponible:</span>
              <span className="text-gray-900">{Number(venta.subtotal).toFixed(2)} €</span>
            </div>
            {Number(venta.descuentos) > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Total Descuentos:</span>
                <span className="text-gray-900">-{Number(venta.descuentos).toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Total IVA:</span>
              <span className="text-gray-900">{Number(venta.impuestos).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between py-4 text-xl font-black">
              <span className="text-gray-900">TOTAL FACTURA:</span>
              <span className="text-gray-900">{Number(venta.total).toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Pie de página */}
        <div className="mt-20 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Método de pago: <span className="capitalize font-medium text-gray-700">{venta.metodo_pago}</span></p>
          <p className="mt-2">Documento generado electrónicamente. Gracias por confiar en Tattoo Studio.</p>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 text-center print:hidden flex justify-center gap-4">
          <button onClick={() => window.print()} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors">
            Imprimir Factura
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
