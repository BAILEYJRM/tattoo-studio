import React, { useState, useEffect } from 'react';
import { getProductos, createArticuloTpv, updateArticuloTpv } from '../api';
import Modal from './Modal';

const COLORES = [
  { id: 'gray', bg: 'bg-gray-800', border: 'border-gray-700', text: 'text-gray-300' },
  { id: 'indigo', bg: 'bg-indigo-900/50', border: 'border-indigo-700', text: 'text-indigo-300' },
  { id: 'emerald', bg: 'bg-emerald-900/50', border: 'border-emerald-700', text: 'text-emerald-300' },
  { id: 'rose', bg: 'bg-rose-900/50', border: 'border-rose-700', text: 'text-rose-300' },
  { id: 'amber', bg: 'bg-amber-900/50', border: 'border-amber-700', text: 'text-amber-300' },
  { id: 'cyan', bg: 'bg-cyan-900/50', border: 'border-cyan-700', text: 'text-cyan-300' },
];

const ICONOS = ['cube', 'sparkles', 'beaker', 'star', 'heart', 'lightning-bolt', 'scissors', 'color-swatch'];

export default function ModalCrearArticuloTpv({ isOpen, onClose, onSave, articuloEdicion = null }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    producto_id: '',
    categoria: 'servicios',
    precio_base: 0,
    color: 'gray',
    icono: 'cube',
    opciones: []
  });

  useEffect(() => {
    if (isOpen) {
      getProductos().then(res => setProductos(res.data)).catch(console.error);
      if (articuloEdicion) {
        setForm({
          nombre: articuloEdicion.nombre,
          producto_id: articuloEdicion.producto_id || '',
          categoria: articuloEdicion.categoria || 'servicios',
          precio_base: articuloEdicion.precio_base || 0,
          color: articuloEdicion.color || 'gray',
          icono: articuloEdicion.icono || 'cube',
          opciones: articuloEdicion.opciones || []
        });
      } else {
        setForm({
          nombre: '',
          producto_id: '',
          categoria: 'servicios',
          precio_base: 0,
          color: 'gray',
          icono: 'cube',
          opciones: []
        });
      }
    }
  }, [isOpen, articuloEdicion]);

  const handleProductoChange = (e) => {
    const prodId = e.target.value;
    const prod = productos.find(p => p.id == prodId);
    if (prod) {
      setForm({
        ...form,
        producto_id: prodId,
        nombre: form.nombre || prod.nombre,
        precio_base: form.precio_base || prod.precio_venta
      });
    } else {
      setForm({ ...form, producto_id: '' });
    }
  };

  const addOpcion = () => {
    setForm({
      ...form,
      opciones: [...form.opciones, { nombre: '', coste: 0 }]
    });
  };

  const removeOpcion = (idx) => {
    const nuevas = form.opciones.filter((_, i) => i !== idx);
    setForm({ ...form, opciones: nuevas });
  };

  const updateOpcion = (idx, campo, valor) => {
    const nuevas = [...form.opciones];
    nuevas[idx][campo] = valor;
    setForm({ ...form, opciones: nuevas });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        producto_id: form.producto_id || null,
        precio_base: Number(form.precio_base)
      };
      
      if (articuloEdicion) {
        await updateArticuloTpv(articuloEdicion.id, payload);
      } else {
        await createArticuloTpv(payload);
      }
      onSave();
      onClose();
    } catch (error) {
      alert('Error al guardar: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={articuloEdicion ? "Editar Artículo TPV" : "Nuevo Artículo TPV"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Producto Base (Opcional)</label>
            <select 
              value={form.producto_id}
              onChange={handleProductoChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Ninguno (Servicio/Libre) --</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock_actual})</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Si seleccionas uno, se descontará stock al vender.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Categoría TPV</label>
            <select 
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="servicios">Servicios</option>
              <option value="piercings_joyeria">Piercing / Joyería</option>
              <option value="otros">Otros</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre a mostrar</label>
            <input 
              type="text" 
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Precio Base (€)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={form.precio_base}
              onChange={(e) => setForm({ ...form, precio_base: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Diseño del Mosaico */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <h3 className="text-sm font-bold text-gray-300 mb-3">Diseño del Mosaico</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Color de fondo</label>
              <div className="flex flex-wrap gap-2">
                {COLORES.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setForm({ ...form, color: c.id })}
                    className={`w-8 h-8 rounded-full border-2 ${c.bg} ${form.color === c.id ? 'border-white' : 'border-transparent'}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Icono</label>
              <div className="flex flex-wrap gap-2">
                {ICONOS.map(ico => (
                  <button
                    key={ico}
                    type="button"
                    onClick={() => setForm({ ...form, icono: ico })}
                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center justify-center border ${form.icono === ico ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-gray-700 bg-gray-800 text-gray-400'}`}
                  >
                    {ico}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Extras / Complementos */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-300">Opciones / Extras</h3>
            <button 
              type="button" 
              onClick={addOpcion}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded"
            >
              + Añadir Extra
            </button>
          </div>
          
          {form.opciones.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No hay extras configurados (ej. Esterilización, Joya Titanio...)</p>
          ) : (
            <div className="space-y-2">
              {form.opciones.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Nombre del extra"
                    value={opt.nombre}
                    onChange={(e) => updateOpcion(idx, 'nombre', e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white"
                  />
                  <div className="relative w-24">
                    <input 
                      type="number" 
                      step="0.01"
                      value={opt.coste}
                      onChange={(e) => updateOpcion(idx, 'coste', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-2 pr-6 py-1.5 text-sm text-white text-right"
                    />
                    <span className="absolute right-2 top-1.5 text-gray-400 text-sm">€</span>
                  </div>
                  <button type="button" onClick={() => removeOpcion(idx)} className="text-red-400 hover:text-red-300 px-2">
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar Artículo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
