import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, isDanger = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${isDanger ? 'bg-red-50 text-red-600 dark:bg-red-950/50' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h4>
        </div>
        
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
        
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition-colors ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}