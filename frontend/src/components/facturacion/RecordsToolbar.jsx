import { Filter, Plus, Search } from 'lucide-react'

export default function RecordsToolbar({ count, searchQuery, onSearchQueryChange, filterEstado, onFilterEstadoChange, filterOptions, onCreate, createLabel, createButtonLabel }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">{createLabel}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Mostrando <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{count}</span> registros filtrados.</p>
        </div>
        <button type="button" onClick={onCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          {createButtonLabel}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Búsqueda</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={searchQuery} onChange={(event) => onSearchQueryChange(event.target.value)} type="search" placeholder="Escribe para buscar" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500" />
          </div>
        </label>

        <label className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Estado</span>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select value={filterEstado} onChange={(event) => onFilterEstadoChange(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500">
              {filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </label>
      </div>
    </div>
  )
}
