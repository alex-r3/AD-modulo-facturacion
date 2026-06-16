import { useOutletContext } from 'react-router-dom'
import ClientsTable from '../../components/facturacion/ClientsTable'
import RecordModal from '../../components/facturacion/RecordModal'
import RecordsToolbar from '../../components/facturacion/RecordsToolbar'

export default function ClientesView() {
  const facturacion = useOutletContext()

  return (
    <div className="space-y-4">
      <RecordsToolbar count={facturacion.filteredClients.length} searchQuery={facturacion.searchQuery} onSearchQueryChange={facturacion.setSearchQuery} filterEstado={facturacion.filterEstado} onFilterEstadoChange={facturacion.setFilterEstado} filterOptions={[{ value: 'Todos', label: 'Todos' }, { value: 'Activo', label: 'Activo' }, { value: 'Inactivo', label: 'Inactivo' }]} onCreate={facturacion.openClienteModal} createLabel="Gestión de clientes" createButtonLabel="Nuevo cliente" />
      <ClientsTable records={facturacion.filteredClients} onDelete={facturacion.handleDeleteCliente} isDeleting={facturacion.isSubmitting} />
      <RecordModal isOpen={facturacion.showClienteModal} mode="cliente" title="Registrar cliente" form={facturacion.clienteForm} onFieldChange={facturacion.handleClienteFieldChange} onClose={facturacion.closeModal} onSubmit={facturacion.handleSubmit} isSubmitting={facturacion.isSubmitting} />
    </div>
  )
}
