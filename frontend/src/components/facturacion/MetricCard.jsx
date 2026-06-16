const toneClasses = {
  indigo: 'text-indigo-600 dark:text-indigo-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  amber: 'text-amber-600 dark:text-amber-400',
  blue: 'text-blue-600 dark:text-blue-400',
  slate: 'text-slate-500 dark:text-slate-400',
}

export default function MetricCard({ title, value, sub, tone = 'indigo' }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">{title}</p>
      <p className={`mt-2 text-2xl font-black ${toneClasses[tone] ?? toneClasses.indigo}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>
    </article>
  )
}
