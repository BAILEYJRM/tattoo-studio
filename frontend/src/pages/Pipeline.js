import React, { useEffect, useState, useCallback } from 'react';
import { getLeads, updateLead, getProyectos, updateProyecto, getEmpleados } from '../api';
import Modal from '../components/Modal';

const ESTADOS_LEADS = ['Nuevo', 'Contactado', 'Interesado', 'En Proceso', 'Convertido', 'Perdido'];
const ESTADOS_PROYECTOS = ['Nuevo', 'En diseño', 'Presupuestado', 'Aprobado', 'En curso', 'Completado', 'Cancelado'];

const BADGE_COLOR = {
  Nuevo: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Contactado: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Interesado: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'En Proceso': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Convertido: 'bg-green-500/10 text-green-400 border-green-500/20',
  Perdido: 'bg-red-500/10 text-red-400 border-red-500/20',
  'En diseño': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Presupuestado: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Aprobado: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'En curso': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Completado: 'bg-green-500/10 text-green-400 border-green-500/20',
  Cancelado: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function Pipeline() {
  const [tab, setTab] = useState('leads'); // 'leads' o 'proyectos'
  const [leads, setLeads] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null); // { type: 'lead'|'proyecto', item }
  const [detalle, setDetalle] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsRes, proyRes, empRes] = await Promise.all([
        getLeads(),
        getProyectos(),
        getEmpleados()
      ]);
      setLeads(leadsRes.data);
      setProyectos(proyRes.data);
      setEmpleados(empRes.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Handler de Drag & Drop
  const handleDragStart = (e, item, type) => {
    setDraggedItem({ type, item });
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, nuevoEstado) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { type, item } = draggedItem;
    if (item.estado === nuevoEstado) return;

    if (type === 'lead') {
      const leadsActualizados = leads.map(l => l.id === item.id ? { ...l, estado: nuevoEstado } : l);
      setLeads(leadsActualizados);
      try {
        await updateLead(item.id, { ...item, estado: nuevoEstado });
      } catch (err) {
        console.error(err);
        cargar();
      }
    } else if (type === 'proyecto') {
      const proyectosActualizados = proyectos.map(p => p.id === item.id ? { ...p, estado: nuevoEstado } : p);
      setProyectos(proyectosActualizados);
      try {
        await updateProyecto(item.id, { ...item, estado: nuevoEstado });
      } catch (err) {
        console.error(err);
        cargar();
      }
    }
    setDraggedItem(null);
  };

  const moverEstadoManual = async (item, type, nuevoEstado) => {
    if (type === 'lead') {
      setLeads(leads.map(l => l.id === item.id ? { ...l, estado: nuevoEstado } : l));
      try {
        await updateLead(item.id, { ...item, estado: nuevoEstado });
      } catch (err) { console.error(err); cargar(); }
    } else {
      setProyectos(proyectos.map(p => p.id === item.id ? { ...p, estado: nuevoEstado } : p));
      try {
        await updateProyecto(item.id, { ...item, estado: nuevoEstado });
      } catch (err) { console.error(err); cargar(); }
    }
    if (detalle && detalle.item.id === item.id) {
      setDetalle({ type, item: { ...item, estado: nuevoEstado } });
    }
  };

  const getNombreArtista = (id) => {
    const e = empleados.find(emp => emp.id === id);
    return e ? e.nombre : '—';
  };

  const estadosActuales = tab === 'leads' ? ESTADOS_LEADS : ESTADOS_PROYECTOS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline Comercial (Kanban)</h1>
          <p className="text-gray-400 text-sm mt-0.5">Arrastra y suelta para cambiar el estado del flujo de ventas</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
          <button onClick={() => setTab('leads')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${tab === 'leads' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            Leads ({leads.length})
          </button>
          <button onClick={() => setTab('proyectos')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${tab === 'proyectos' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            Proyectos ({proyectos.length})
          </button>
        </div>
      </div>

      {/* Tablero Kanban */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {estadosActuales.map(colEstado => {
            const itemsCol = tab === 'leads'
              ? leads.filter(l => (l.estado || 'Nuevo') === colEstado)
              : proyectos.filter(p => (p.estado || 'Nuevo') === colEstado);

            return (
              <div key={colEstado}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, colEstado)}
                className="w-72 flex-shrink-0 bg-gray-900/60 border border-gray-800 rounded-2xl flex flex-col max-h-[75vh]">

                {/* Column Header */}
                <div className="p-3.5 border-b border-gray-800/80 flex items-center justify-between bg-gray-900/80 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${BADGE_COLOR[colEstado] ? 'bg-indigo-400' : 'bg-gray-500'}`} />
                    <h3 className="text-white font-semibold text-xs">{colEstado}</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-mono font-bold">
                    {itemsCol.length}
                  </span>
                </div>

                {/* Column Content */}
                <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5 custom-scrollbar min-h-[150px]">
                  {itemsCol.length === 0 ? (
                    <div className="h-28 flex items-center justify-center border-2 border-dashed border-gray-800/50 rounded-xl text-gray-600 text-xs">
                      Arrastra aquí
                    </div>
                  ) : (
                    itemsCol.map(item => (
                      <div key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item, tab === 'leads' ? 'lead' : 'proyecto')}
                        onClick={() => setDetalle({ type: tab === 'leads' ? 'lead' : 'proyecto', item })}
                        className="bg-gray-800 border border-gray-700/80 hover:border-indigo-500/50 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group">

                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-white font-medium text-xs group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {item.nombre}
                          </h4>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${BADGE_COLOR[item.estado] || 'border-gray-700 text-gray-400'}`}>
                            {item.estado}
                          </span>
                        </div>

                        {tab === 'leads' ? (
                          <div className="text-[11px] text-gray-400 space-y-1">
                            {item.email && <p className="truncate">✉ {item.email}</p>}
                            {item.telefono && <p>📞 {item.telefono}</p>}
                            {item.origen && <p className="text-gray-500 text-[10px]">Origen: {item.origen}</p>}
                          </div>
                        ) : (
                          <div className="text-[11px] text-gray-400 space-y-1">
                            {item.estilo && <p>🎨 Estilo: {item.estilo}</p>}
                            {item.precio_estimado && <p className="text-emerald-400 font-bold">💰 {Number(item.precio_estimado).toFixed(0)} €</p>}
                            {item.artista_id && <p className="text-gray-500 text-[10px]">Artista: {getNombreArtista(item.artista_id)}</p>}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detalle + Cambio manual de estado */}
      {detalle && (
        <Modal isOpen={true} onClose={() => setDetalle(null)} title={`Detalle (${detalle.type === 'lead' ? 'Lead' : 'Proyecto'})`} maxWidth="max-w-md">
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-gray-500 text-xs block">Nombre</span>
              <p className="text-white font-semibold text-base">{detalle.item.nombre}</p>
            </div>

            <div>
              <span className="text-gray-500 text-xs block mb-1">Mover a otro estado</span>
              <div className="flex flex-wrap gap-1.5">
                {(detalle.type === 'lead' ? ESTADOS_LEADS : ESTADOS_PROYECTOS).map(st => (
                  <button key={st} onClick={() => moverEstadoManual(detalle.item, detalle.type, st)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${detalle.item.estado === st ? 'bg-indigo-600 text-white border-indigo-500 font-bold' : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500'}`}>
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {detalle.item.descripcion && (
              <div>
                <span className="text-gray-500 text-xs block">Descripción</span>
                <p className="text-gray-300 text-xs whitespace-pre-wrap">{detalle.item.descripcion}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-700">
            <button onClick={() => setDetalle(null)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg font-medium transition-colors">
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
