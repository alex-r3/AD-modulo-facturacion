import { Plus, Trash2, X } from 'lucide-react'
import {
  CLIENTE_ESTADOS,
  FACTURA_ESTADOS,
  IVA_PERCENT,
  TIPO_CLIENTE_OPTIONS,
  TIPO_PAGO_OPTIONS,
} from '../../utils/validators'

const formatMoney = (value) => new Intl.NumberFormat('es-CO').format(Number(value) || 0)

export default function RecordModal({
  isOpen,
  mode,
  title,
  form,
  onFieldChange,
  onClose,
  onSubmit,
  clients = [],
  isSubmitting = false,
  detailForm,
  detailItems = [],
  onDetailFieldChange,
  onAddDetail,
  onRemoveDetail,
  totals = { subtotal: 0, total_iva: 0, total: 0 },
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Formulario</p>
            <h3 className="mt-1 text-lg font-black text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          {mode === 'cliente' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Cedula</span>
                <input
                  value={form.cedula}
                  onChange={(event) => onFieldChange('cedula', event.target.value)}
                  type="text"
                  inputMode="numeric"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="123456789"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Nombre</span>
                <input
                  value={form.nombre}
                  onChange={(event) => onFieldChange('nombre', event.target.value)}
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Nombre completo o razon social"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Fecha nacimiento</span>
                <input
                  value={form.fecha_nacimiento}
                  onChange={(event) => onFieldChange('fecha_nacimiento', event.target.value)}
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Tipo cliente</span>
                <select
                  value={form.tipo_cliente}
                  onChange={(event) => onFieldChange('tipo_cliente', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {TIPO_CLIENTE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Direccion</span>
                <input
                  value={form.direccion}
                  onChange={(event) => onFieldChange('direccion', event.target.value)}
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Direccion principal"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Telefono</span>
                <input
                  value={form.telefono}
                  onChange={(event) => onFieldChange('telefono', event.target.value)}
                  type="tel"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="+57 300 123 4567"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Email</span>
                <input
                  value={form.email}
                  onChange={(event) => onFieldChange('email', event.target.value)}
                  type="email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="cliente@correo.com"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Estado</span>
                <select
                  value={form.estado}
                  onChange={(event) => onFieldChange('estado', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {CLIENTE_ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 md:col-span-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Numero factura</span>
                  <input
                    value={form.numero_factura}
                    onChange={(event) => onFieldChange('numero_factura', event.target.value)}
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="ABC-123-123456789"
                  />
                </label>

                <label className="space-y-1 md:col-span-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Cliente</span>
                  <select
                    value={form.cliente_id}
                    onChange={(event) => onFieldChange('cliente_id', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="">Selecciona un cliente</option>
                    {clients.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} - {cliente.cedula}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Tipo pago</span>
                  <select
                    value={form.tipo_pago}
                    onChange={(event) => onFieldChange('tipo_pago', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    {TIPO_PAGO_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Fecha emision</span>
                  <input
                    value={form.fecha_emision}
                    onChange={(event) => onFieldChange('fecha_emision', event.target.value)}
                    type="date"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                <label className="space-y-1 md:col-span-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Estado</span>
                  <select
                    value={form.estado}
                    onChange={(event) => onFieldChange('estado', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    {FACTURA_ESTADOS.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Detalle de factura</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Agrega productos y valida montos automaticamente.</p>
                  </div>
                  <button
                    type="button"
                    onClick={onAddDetail}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar detalle
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Producto ID</span>
                    <input
                      value={detailForm?.producto_id ?? ''}
                      onChange={(event) => onDetailFieldChange('producto_id', event.target.value)}
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      placeholder="PROD-001"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Producto nombre</span>
                    <input
                      value={detailForm?.producto_nombre ?? ''}
                      onChange={(event) => onDetailFieldChange('producto_nombre', event.target.value)}
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      placeholder="Servicio de mantenimiento"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Cantidad</span>
                    <input
                      value={detailForm?.cantidad ?? ''}
                      onChange={(event) => onDetailFieldChange('cantidad', event.target.value)}
                      type="number"
                      min="1"
                      step="1"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Precio unitario</span>
                    <input
                      value={detailForm?.precio_unitario ?? ''}
                      onChange={(event) => onDetailFieldChange('precio_unitario', event.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 md:col-span-2">
                    <input
                      checked={Boolean(detailForm?.graba_iva)}
                      onChange={(event) => onDetailFieldChange('graba_iva', event.target.checked)}
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">Graba IVA</span>
                  </label>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-slate-100 font-bold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                      <tr>
                        <th className="px-3 py-2">Producto</th>
                        <th className="px-3 py-2">Cant.</th>
                        <th className="px-3 py-2">P. Unit</th>
                        <th className="px-3 py-2">IVA</th>
                        <th className="px-3 py-2">Subt.</th>
                        <th className="px-3 py-2 text-right">Accion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {detailItems.length === 0 ? (
                        <tr>
                          <td className="px-3 py-3 text-slate-500 dark:text-slate-400" colSpan={6}>
                            Sin detalles agregados todavia.
                          </td>
                        </tr>
                      ) : (
                        detailItems.map((item) => (
                          <tr key={item.producto_id}>
                            <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-100">{item.producto_nombre}</td>
                            <td className="px-3 py-2">{item.cantidad}</td>
                            <td className="px-3 py-2">${formatMoney(item.precio_unitario)}</td>
                            <td className="px-3 py-2">{item.graba_iva ? 'Si' : 'No'}</td>
                            <td className="px-3 py-2">${formatMoney(item.subtotal_linea)}</td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => onRemoveDetail(item.producto_id)}
                                className="inline-flex items-center justify-center rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl bg-white px-3 py-2 text-sm dark:bg-slate-900">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Subtotal</span>
                    <span className="font-black text-slate-900 dark:text-slate-100">${formatMoney(totals.subtotal)}</span>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 text-sm dark:bg-slate-900">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">IVA ({IVA_PERCENT}%)</span>
                    <span className="font-black text-slate-900 dark:text-slate-100">${formatMoney(totals.total_iva)}</span>
                  </div>
                  <div className="rounded-xl bg-indigo-50 px-3 py-2 text-sm dark:bg-indigo-950/30">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">Total</span>
                    <span className="font-black text-indigo-700 dark:text-indigo-300">${formatMoney(totals.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
