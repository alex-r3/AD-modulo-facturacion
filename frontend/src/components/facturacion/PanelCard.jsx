export default function PanelCard({ title, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 ${className}`}>
      {title ? <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">{title}</h3> : null}
      <div className={title ? 'mt-4' : ''}>{children}</div>
    </section>
  )
}
