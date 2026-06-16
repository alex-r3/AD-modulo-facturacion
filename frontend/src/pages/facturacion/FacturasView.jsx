import { useOutletContext } from 'react-router-dom'
import InvoicesTable from '../../components/facturacion/InvoicesTable'
import RecordModal from '../../components/facturacion/RecordModal'
import RecordsToolbar from '../../components/facturacion/RecordsToolbar'

export default function FacturasView() {
  const facturacion = useOutletContext()

  return (
    <div className="space-y-4">
      <RecordsToolbar count={facturacion.filteredInvoices.length} searchQuery={facturacion.searchQuery} onSearchQueryChange={facturacion.setSearchQuery} filterEstado={facturacion.filterEstado} onFilterEstadoChange={facturacion.setFilterEstado} filterOptions={[{ value: 'Todos', label: 'Todos' }, { value: 'Emitida', label: 'Emitida' }, { value: 'Pagada', label: 'Pagada' }, { value: 'Anulada', label: 'Anulada' }]} onCreate={facturacion.openFacturaModal} createLabel="Gestión de facturas" createButtonLabel="Nueva factura" />
      <InvoicesTable records={facturacion.filteredInvoices} onDelete={facturacion.handleDeleteFactura} isDeleting={facturacion.isSubmitting} />
      <RecordModal isOpen={facturacion.showFacturaModal} mode="factura" title="Emitir factura" form={facturacion.facturaForm} onFieldChange={facturacion.handleInvoiceFieldChange} onClose={facturacion.closeModal} onSubmit={facturacion.handleSubmit} clients={facturacion.availableClients} isSubmitting={facturacion.isSubmitting} detailForm={facturacion.detalleForm} detailItems={facturacion.detalleItems} onDetailFieldChange={facturacion.handleDetalleFieldChange} onAddDetail={facturacion.addDetalleItem} onRemoveDetail={facturacion.removeDetalleItem} totals={facturacion.facturaTotals} />
    </div>
  )
}
