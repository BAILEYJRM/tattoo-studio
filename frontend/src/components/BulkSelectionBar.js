import React from 'react';

export default function BulkSelectionBar({ selectedCount, onClearSelection, onDelete }) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl border border-gray-700 animate-fade-in-up">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center bg-indigo-500 text-xs font-bold w-6 h-6 rounded-full">
          {selectedCount}
        </span>
        <span className="text-sm font-medium">elementos seleccionados</span>
      </div>

      <div className="w-px h-6 bg-gray-600 mx-1"></div>

      <button
        onClick={onClearSelection}
        className="text-sm text-gray-400 hover:text-white transition-colors"
      >
        Cancelar
      </button>

      {onDelete && (
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors border border-red-500/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar
        </button>
      )}
    </div>
  );
}
