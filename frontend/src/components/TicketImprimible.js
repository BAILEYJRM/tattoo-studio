import React, { useEffect } from 'react';

export default function TicketImprimible({ venta, onClose }) {
  useEffect(() => {
    // Retrasar la impresión un momento para asegurar que el DOM está listo
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!venta) return null;

  return (
    <div className="fixed inset-0 bg-white z-[9999] overflow-y-auto text-black p-4 font-mono text-sm print:p-0">
      <div className="max-w-[80mm] mx-auto bg-white min-h-screen print:min-h-0 print:w-full">
        {/* Cabecera del ticket */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1">TATTOO STUDIO</h1>
          <p className="text-xs">Calle Principal, 123</p>
          <p className="text-xs">28001 Madrid, España</p>
          <p className="text-xs">CIF: B12345678</p>
          <p className="text-xs">Tlf: 91 234 56 78</p>
          <div className="border-b border-dashed border-gray-400 my-4"></div>
          <p className="text-xs">Ticket: #{venta.id.toString().padStart(6, '0')}</p>
          <p className="text-xs">Fecha: {new Date(venta.fecha).toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
          {venta.cliente_nombre && <p className="text-xs">Cliente: {venta.cliente_nombre}</p>}
          <div className="border-b border-dashed border-gray-400 my-4"></div>
        </div>

        {/* Líneas de detalle */}
        <div className="mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-dashed border-gray-400">
                <th className="text-left py-1">Cant</th>
                <th className="text-left py-1">Descripción</th>
                <th className="text-right py-1">Precio</th>
                <th className="text-right py-1">Importe</th>
              </tr>
            </thead>
            <tbody>
              {venta.lineas?.map((l, i) => (
                <tr key={i}>
                  <td className="py-1 align-top">{l.cantidad}</td>
                  <td className="py-1 pr-2">
                    {l.descripcion}
                    {Number(l.descuento_porcentaje) > 0 && <div className="text-[10px] text-gray-500">Dto: {l.descuento_porcentaje}%</div>}
                  </td>
                  <td className="text-right py-1 align-top">{Number(l.precio_unitario).toFixed(2)}</td>
                  <td className="text-right py-1 align-top">{Number(l.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-b border-dashed border-gray-400 my-4"></div>
        </div>

        {/* Totales */}
        <div className="text-right mb-6">
          <div className="flex justify-between mb-1 text-xs">
            <span>Subtotal:</span>
            <span>{Number(venta.subtotal).toFixed(2)} €</span>
          </div>
          {Number(venta.descuentos) > 0 && (
            <div className="flex justify-between mb-1 text-xs">
              <span>Descuentos:</span>
              <span>-{Number(venta.descuentos).toFixed(2)} €</span>
            </div>
          )}
          <div className="flex justify-between mb-1 text-xs">
            <span>Impuestos (IVA):</span>
            <span>{Number(venta.impuestos).toFixed(2)} €</span>
          </div>
          <div className="flex justify-between mt-2 font-bold text-lg">
            <span>TOTAL:</span>
            <span>{Number(venta.total).toFixed(2)} €</span>
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span>Forma de pago:</span>
            <span className="capitalize">{venta.metodo_pago}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-gray-400 my-4"></div>
        
        {/* Pie */}
        <div className="text-center text-xs mt-6">
          <p>¡Gracias por su visita!</p>
          <p className="mt-2 text-[10px] text-gray-500">Conserve este ticket para cualquier reclamación o devolución. Plazo máximo 15 días.</p>
        </div>

        {/* Botones de acción (no se imprimen) */}
        <div className="mt-12 text-center print:hidden flex justify-center gap-4">
          <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-white rounded shadow">Imprimir</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-black rounded shadow">Cerrar</button>
        </div>
      </div>
      
      {/* Estilos específicos para impresión */}
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
          }
        }
      `}} />
    </div>
  );
}
