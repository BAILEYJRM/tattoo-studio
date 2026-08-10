import React from 'react';

const EVENTO_COLOR_HEX = {
  'convención': '#a855f7',
  'viaje': '#3b82f6',
  'formación': '#22c55e',
  'otro': '#6b7280',
};

function getPositionStyle(startTime, endTime) {
  const minHour = 8;
  const maxHour = 22;
  const totalMinutes = (maxHour - minHour) * 60;

  let startHour = 8, startMin = 0;
  if (startTime) {
    const parts = startTime.split(':');
    startHour = parseInt(parts[0], 10);
    startMin = parseInt(parts[1], 10);
  }

  let endHour = startHour + 1, endMin = startMin;
  if (endTime) {
    const parts = endTime.split(':');
    endHour = parseInt(parts[0], 10);
    endMin = parseInt(parts[1], 10);
  }

  const startTotalMins = Math.max(0, (startHour - minHour) * 60 + startMin);
  let endTotalMins = (endHour - minHour) * 60 + endMin;
  if (endTotalMins <= startTotalMins) endTotalMins = startTotalMins + 60;

  const top = `${(startTotalMins / totalMinutes) * 100}%`;
  const height = `${((endTotalMins - startTotalMins) / totalMinutes) * 100}%`;

  return { top, height };
}

export default function TimeGrid({ mode, citas, eventos, currentDate, onChangeDate, showWeekends, showCompleted, showRejected, onCitaClick, onEventoClick, onEmptySlotClick }) {
  const minHour = 8;
  const maxHour = 22;
  const hours = Array.from({ length: maxHour - minHour }, (_, i) => minHour + i);

  // Determine days to show
  const days = [];
  const baseDate = currentDate ? new Date(currentDate) : new Date();
  
  if (mode === 'dia') {
    days.push(baseDate);
  } else {
    // Week view
    const dayOfWeek = baseDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + diffToMonday);
    
    const numDays = showWeekends ? 7 : 5;
    for (let i = 0; i < numDays; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
  }

  const DAY_NAMES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  const changeDate = (dir) => {
    const next = new Date(baseDate);
    if (mode === 'dia') {
      next.setDate(next.getDate() + dir);
    } else {
      next.setDate(next.getDate() + dir * 7);
    }
    onChangeDate(next.toISOString().split('T')[0]);
  };

  const getDayItems = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    let dayCitas = citas.filter(c => c.fecha?.split('T')[0] === dateStr);
    if (!showCompleted) dayCitas = dayCitas.filter(c => c.estado !== 'completada');
    if (!showRejected) dayCitas = dayCitas.filter(c => c.estado !== 'cancelada');

    const dayEventos = eventos.filter(ev => {
      if (!ev.fecha_inicio || !ev.fecha_fin) return false;
      const start = new Date(ev.fecha_inicio.split('T')[0]);
      const end = new Date(ev.fecha_fin.split('T')[0]);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    });

    return { dayCitas, dayEventos };
  };

  const handleSlotClick = (e, dateObj) => {
    // If we clicked on an event or a cita, don't trigger slot click
    if (e.target.closest('.cursor-pointer')) return;
    if (!onEmptySlotClick) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = y / rect.height;
    
    const totalMinutes = (maxHour - minHour) * 60;
    
    let clickedMinutes = Math.floor(percentage * totalMinutes);
    // snap to 30 minutes
    clickedMinutes = Math.floor(clickedMinutes / 30) * 30;
    
    const hour = minHour + Math.floor(clickedMinutes / 60);
    const minute = clickedMinutes % 60;
    
    onEmptySlotClick(dateObj, hour, minute);
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
        <h2 className="text-xl font-bold text-white capitalize">
          {mode === 'dia' ? `${baseDate.getDate()} ${monthNames[baseDate.getMonth()]} ${baseDate.getFullYear()}` : 
           `${monthNames[days[0].getMonth()]} ${days[0].getFullYear()}`}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => changeDate(-1)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => changeDate(1)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="flex bg-gray-800/30 overflow-y-auto" style={{ height: '70vh' }}>
        {/* Time axis */}
        <div className="flex flex-col w-16 flex-shrink-0 border-r border-gray-800 bg-gray-900">
          <div className="h-12 border-b border-gray-800" /> {/* Empty corner */}
          <div className="relative flex-1" style={{ minHeight: `${hours.length * 60}px` }}>
            {hours.map(hour => (
              <div key={hour} className="absolute w-full text-right pr-2 text-xs text-gray-500" style={{ top: `${((hour - minHour) / (maxHour - minHour)) * 100}%`, transform: 'translateY(-50%)' }}>
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>
        </div>

        {/* Days grid */}
        <div className={`flex-1 grid ${days.length === 1 ? 'grid-cols-1' : days.length === 5 ? 'grid-cols-5' : 'grid-cols-7'}`}>
          {days.map((dateObj, idx) => {
            const { dayCitas, dayEventos } = getDayItems(dateObj);
            
            const todayDate = new Date();
            const isToday = dateObj.getFullYear() === todayDate.getFullYear() && 
                            dateObj.getMonth() === todayDate.getMonth() && 
                            dateObj.getDate() === todayDate.getDate();

            return (
              <div key={idx} className="flex flex-col border-r border-gray-700 last:border-r-0">
                {/* Day Header */}
                <div className="h-12 flex flex-col items-center justify-center border-b border-gray-700 bg-gray-900 sticky top-0 z-10">
                  <span className="text-xs text-gray-400 font-semibold uppercase">{DAY_NAMES[dateObj.getDay()]}</span>
                  <span className={`text-sm mt-0.5 ${isToday ? 'w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded-full font-bold' : 'text-gray-300'}`}>
                    {dateObj.getDate()}
                  </span>
                </div>
                
                {/* Day Content */}
                <div className="relative flex-1 bg-gray-800" style={{ minHeight: `${hours.length * 60}px` }} onClick={(e) => handleSlotClick(e, dateObj)}>
                  {/* Grid lines */}
                  {hours.map(hour => (
                    <div key={hour} className="absolute w-full border-t border-gray-700" style={{ top: `${((hour - minHour) / (maxHour - minHour)) * 100}%` }} />
                  ))}
                  
                  {/* Events - rendered on top, full width */}
                  {dayEventos.map((ev, i) => (
                    <div key={`ev-${i}`} 
                         onClick={() => onEventoClick && onEventoClick(ev)}
                         className="absolute w-[96%] left-[2%] z-10 px-2 py-1.5 text-xs text-white overflow-hidden shadow-sm rounded border-l-4 cursor-pointer hover:brightness-110 transition-all"
                      style={{ 
                        backgroundColor: EVENTO_COLOR_HEX[ev.tipo] ? `${EVENTO_COLOR_HEX[ev.tipo]}90` : `${EVENTO_COLOR_HEX.otro}90`,
                        borderLeftColor: EVENTO_COLOR_HEX[ev.tipo] || EVENTO_COLOR_HEX.otro,
                        top: `${(i * 32) + 4}px`, height: '28px' // Stack them instead of 100% height
                      }}>
                      <div className="font-semibold truncate">{ev.titulo}</div>
                    </div>
                  ))}

                  {/* Appointments */}
                  {(() => {
                    // Calculamos solapamientos
                    const sorted = [...dayCitas].sort((a, b) => (a.hora_inicio || '00:00').localeCompare(b.hora_inicio || '00:00'));
                    const columns = [];
                    sorted.forEach(cita => {
                      let placed = false;
                      for (let i = 0; i < columns.length; i++) {
                        const lastCita = columns[i][columns[i].length - 1];
                        if (lastCita.hora_fin <= cita.hora_inicio) {
                          columns[i].push(cita);
                          cita._col = i;
                          placed = true;
                          break;
                        }
                      }
                      if (!placed) {
                        cita._col = columns.length;
                        columns.push([cita]);
                      }
                    });
                    const totalCols = columns.length || 1;

                    return sorted.map((c, i) => {
                      const pos = getPositionStyle(c.hora_inicio, c.hora_fin);
                      const widthPercent = 96 / totalCols;
                      const leftPercent = 2 + (c._col * widthPercent);
                      return (
                        <div key={`c-${i}`} 
                             onClick={() => onCitaClick && onCitaClick(c)}
                             className="absolute z-20 px-2 py-1.5 rounded text-xs text-white overflow-hidden shadow-md border-l-4 leading-tight cursor-pointer hover:brightness-110 transition-all"
                          style={{
                            top: pos.top, height: pos.height,
                            width: `${widthPercent}%`, left: `${leftPercent}%`,
                            backgroundColor: c.artista_color ? `${c.artista_color}` : '#6366f1',
                            borderColor: 'rgba(0,0,0,0.2)'
                          }}>
                          <div className="font-bold mb-0.5">{c.hora_inicio?.slice(0,5)} - {c.hora_fin?.slice(0,5)}</div>
                          <div className="font-semibold truncate mb-0.5">{c.cliente_nombre}</div>
                          <div className="truncate text-[10px] text-white/90">{c.artista_nombre} {c.cabina_nombre ? `- ${c.cabina_nombre}` : ''}</div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
