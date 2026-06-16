import { Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge'

export default function InvoicesTable({ records, onDelete, isDeleting = false }) {
  if (!records.length) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">No hay facturas que coincidan con los filtros actuales.</div>
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 dark:bg-slate-950">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Numero</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Emision</th>
              <th className="px-4 py-3">Subtotal</th>
              <th className="px-4 py-3">IVA</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.map((factura) => (
              <tr key={factura.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="px-4 py-4 text-xs font-semibold text-slate-500">{factura.id}</td>
                <td className="px-4 py-4 font-semibold text-slate-900 dark:text-slate-100">{factura.numero_factura}</td>
                <td className="px-4 py-4 font-semibold text-slate-900 dark:text-slate-100">{factura.clienteNombre}</td>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{factura.tipo_pago}</td>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{factura.fecha_emision}</td>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400">${new Intl.NumberFormat('es-CO').format(factura.subtotal)}</td>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400">${new Intl.NumberFormat('es-CO').format(factura.total_iva)}</td>
                <td className="px-4 py-4 font-bold text-slate-900 dark:text-slate-100">${new Intl.NumberFormat('es-CO').format(factura.total)}</td>
                <td className="px-4 py-4"><StatusBadge value={factura.estado} /></td>
                <td className="px-4 py-4 text-right">
                  <button type="button" onClick={() => onDelete(factura.id)} disabled={isDeleting} className="inline-flex items-center justify-center rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/40" aria-label={`Eliminar factura ${factura.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
