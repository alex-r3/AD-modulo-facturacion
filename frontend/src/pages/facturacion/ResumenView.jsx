import { useOutletContext } from 'react-router-dom'
import MetricCard from '../../components/facturacion/MetricCard'
import PanelCard from '../../components/facturacion/PanelCard'

export default function ResumenView() {
  const { kpis } = useOutletContext()

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{kpis.map((kpi) => <MetricCard key={kpi.title} {...kpi} />)}</section>
      <section className="grid gap-4 xl:grid-cols-2">
        <PanelCard title="Actividad de auditoría">
          <div className="space-y-4">{[{ title: 'Factura FAC-2026-003 generada', desc: 'Cliente Distribuidora Alianza' }, { title: 'Cliente CLI-801 registrado', desc: 'Inversiones Globales S.A.' }, { title: 'Factura FAC-2026-001 pagada', desc: 'Transferencia bancaria recibida' }].map((item) => <article key={item.title} className="border-l-2 border-indigo-500 pl-4"><p className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.desc}</p></article>)}</div>
        </PanelCard>
        <PanelCard title="Canales de ingresos">{[{ label: 'Cobros completados', value: '78%', width: '78%', tone: 'bg-emerald-500' }, { label: 'Por conciliar', value: '22%', width: '22%', tone: 'bg-amber-500' }].map((item) => <div key={item.label} className="space-y-2"><div className="flex items-center justify-between"><span className="text-slate-500 dark:text-slate-400">{item.label}</span><span className="font-bold">{item.value}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full ${item.tone}`} style={{ width: item.width }} /></div></div>)}</PanelCard>
      </section>
    </div>
  )
}
