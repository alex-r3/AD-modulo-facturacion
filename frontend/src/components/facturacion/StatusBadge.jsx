const styleMap = {
  Activo: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  Inactivo: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  Pagada: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  Pendiente: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Emitida: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  Anulada: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
}

export default function StatusBadge({ value }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${styleMap[value] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{value}</span>
}
