import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createCliente, createFactura, deleteCliente, deleteFactura, getFacturacionSnapshot } from '../api/facturacionService'
import {
  calculateFacturaTotals,
  FACTURA_ESTADOS,
  getFirstError,
  TIPO_CLIENTE_OPTIONS,
  TIPO_PAGO_OPTIONS,
  validateClienteForm,
  validateDetalleFacturaForm,
  validateFacturaForm,
} from '../utils/validators'

const THEME_KEY = 'facturacion-theme'
const INITIAL_CLIENT_FORM = {
  cedula: '',
  nombre: '',
  fecha_nacimiento: '',
  tipo_cliente: 'Contado',
  direccion: '',
  telefono: '',
  email: '',
  estado: 'Activo',
}
const INITIAL_FACTURA_FORM = {
  numero_factura: '',
  cliente_id: '',
  tipo_pago: 'Efectivo',
  fecha_emision: new Date().toISOString().split('T')[0],
  estado: 'Emitida',
}
const INITIAL_DETALLE_FORM = {
  producto_id: '',
  producto_nombre: '',
  cantidad: '',
  precio_unitario: '',
  graba_iva: true,
}

const formatMoney = (value) => `$${new Intl.NumberFormat('es-CO').format(Number(value) || 0)}`

const getSectionFromPath = (pathname) => {
  if (pathname.includes('/clientes')) return 'Clientes'
  if (pathname.includes('/facturas')) return 'Facturas'
  return 'Resumen'
}

export function useFacturacion() {
  const location = useLocation()
  const [clientes, setClientes] = useState([])
  const [facturas, setFacturas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('cliente')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEstado, setFilterEstado] = useState('Todos')
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    const savedTheme = window.localStorage.getItem(THEME_KEY)
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [clienteForm, setClienteForm] = useState(INITIAL_CLIENT_FORM)
  const [facturaForm, setFacturaForm] = useState(INITIAL_FACTURA_FORM)
  const [detalleForm, setDetalleForm] = useState(INITIAL_DETALLE_FORM)
  const [detalleItems, setDetalleItems] = useState([])
  const [busyAction, setBusyAction] = useState(null)

  useEffect(() => {
    let mounted = true

    getFacturacionSnapshot()
      .then((snapshot) => {
        if (!mounted) return
        setClientes(snapshot.clientes)
        setFacturas(snapshot.facturas)
      })
      .catch(() => {
        toast.error('No fue posible cargar la información de facturación.')
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.document.documentElement.classList.toggle('dark', themeMode === 'dark')
    window.localStorage.setItem(THEME_KEY, themeMode)
  }, [themeMode])

  const currentSection = useMemo(() => getSectionFromPath(location.pathname), [location.pathname])
  const availableClients = useMemo(() => clientes, [clientes])
  const facturaTotals = useMemo(() => calculateFacturaTotals(detalleItems), [detalleItems])

  const kpis = useMemo(() => {
    const totalFacturado = facturas.reduce((accumulator, factura) => accumulator + Number(factura.total || 0), 0)
    const pagadasCount = facturas.filter((factura) => factura.estado === 'Pagada').length
    const emitidasCount = facturas.filter((factura) => factura.estado === 'Emitida').length
    const clientesActivos = clientes.filter((cliente) => cliente.estado === 'Activo').length

    if (currentSection === 'Clientes') {
      return [
        { title: 'Total clientes', value: clientes.length, sub: 'Registros en catálogo', tone: 'indigo' },
        { title: 'Clientes activos', value: clientesActivos, sub: 'Operaciones vigentes', tone: 'emerald' },
        { title: 'Clientes inactivos', value: clientes.length - clientesActivos, sub: 'Sin actividad', tone: 'slate' },
        { title: 'Tipos de cliente', value: TIPO_CLIENTE_OPTIONS.length, sub: 'Contado / Crédito', tone: 'blue' },
      ]
    }

    if (currentSection === 'Facturas') {
      return [
        { title: 'Total facturas', value: facturas.length, sub: 'Cabeceras emitidas', tone: 'indigo' },
        { title: 'Pagadas', value: pagadasCount, sub: 'Conciliadas', tone: 'emerald' },
        { title: 'Emitidas', value: emitidasCount, sub: 'Pendientes de cobro', tone: 'amber' },
        { title: 'Tipos de pago', value: TIPO_PAGO_OPTIONS.length, sub: 'Efectivo / Crédito', tone: 'blue' },
      ]
    }

    return [
      { title: 'Facturado total', value: formatMoney(totalFacturado), sub: 'Total consolidado', tone: 'indigo' },
      { title: 'IVA acumulado', value: formatMoney(facturas.reduce((acc, factura) => acc + Number(factura.total_iva || 0), 0)), sub: 'Impuesto generado', tone: 'emerald' },
      { title: 'Facturas pagadas', value: pagadasCount, sub: 'Flujo de caja', tone: 'amber' },
      { title: 'Clientes activos', value: clientesActivos, sub: 'Cartera vigente', tone: 'blue' },
    ]
  }, [clientes, currentSection, facturas])

  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return clientes.filter((cliente) => {
      const matchesQuery =
        !query ||
        cliente.nombre.toLowerCase().includes(query) ||
        cliente.cedula.toLowerCase().includes(query) ||
        cliente.email.toLowerCase().includes(query) ||
        cliente.id.toLowerCase().includes(query)
      const matchesEstado = filterEstado === 'Todos' || cliente.estado === filterEstado
      return matchesQuery && matchesEstado
    })
  }, [clientes, filterEstado, searchQuery])

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return facturas.filter((factura) => {
      const matchesQuery =
        !query ||
        factura.clienteNombre.toLowerCase().includes(query) ||
        factura.numero_factura.toLowerCase().includes(query) ||
        factura.id.toLowerCase().includes(query)
      const matchesEstado = filterEstado === 'Todos' || factura.estado === filterEstado
      return matchesQuery && matchesEstado
    })
  }, [facturas, filterEstado, searchQuery])

  const openClienteModal = () => {
    setModalMode('cliente')
    setIsModalOpen(true)
  }

  const openFacturaModal = () => {
    setModalMode('factura')
    setIsModalOpen(true)
  }

  const closeModal = () => setIsModalOpen(false)
  const toggleTheme = () => setThemeMode((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  const resetClientForm = () => setClienteForm(INITIAL_CLIENT_FORM)
  const resetInvoiceForm = () => setFacturaForm({
    ...INITIAL_FACTURA_FORM,
    fecha_emision: new Date().toISOString().split('T')[0],
  })
  const resetDetalleForm = () => setDetalleForm(INITIAL_DETALLE_FORM)
  const resetDetalleItems = () => setDetalleItems([])

  const handleClienteFieldChange = (field, value) => setClienteForm((currentForm) => ({ ...currentForm, [field]: value }))
  const handleInvoiceFieldChange = (field, value) => setFacturaForm((currentForm) => ({ ...currentForm, [field]: value }))
  const handleDetalleFieldChange = (field, value) => setDetalleForm((currentForm) => ({ ...currentForm, [field]: value }))

  const addDetalleItem = () => {
    const validation = validateDetalleFacturaForm(detalleForm)
    if (!validation.valid) {
      toast.error(getFirstError(validation.errors))
      return false
    }

    setDetalleItems((currentItems) => {
      if (currentItems.some((item) => item.producto_id === validation.values.producto_id)) {
        toast.error('No puedes repetir el mismo producto en el detalle.')
        return currentItems
      }
      return [...currentItems, validation.values]
    })
    resetDetalleForm()
    return true
  }

  const removeDetalleItem = (productoId) => {
    setDetalleItems((currentItems) => currentItems.filter((item) => item.producto_id !== productoId))
  }

  const submitCliente = async () => {
    const validation = validateClienteForm(clienteForm, clientes)
    if (!validation.valid) {
      toast.error(getFirstError(validation.errors))
      return false
    }

    setBusyAction('cliente')
    try {
      const snapshot = await createCliente(validation.values)
      setClientes(snapshot.clientes)
      setFacturas(snapshot.facturas)
      toast.success(`Cliente "${validation.values.nombre}" registrado correctamente.`)
      resetClientForm()
      closeModal()
      return true
    } catch (error) {
      toast.error(error.message || 'No fue posible registrar el cliente.')
      return false
    } finally {
      setBusyAction(null)
    }
  }

  const submitFactura = async () => {
    const validation = validateFacturaForm(facturaForm, clientes, facturas, detalleItems)
    if (!validation.valid) {
      toast.error(getFirstError(validation.errors))
      return false
    }

    const totals = calculateFacturaTotals(detalleItems)

    setBusyAction('factura')
    try {
      const snapshot = await createFactura({
        ...validation.values,
        ...totals,
        detalles: detalleItems,
      })
      setClientes(snapshot.clientes)
      setFacturas(snapshot.facturas)
      toast.success(`Factura emitida por ${formatMoney(totals.total)}.`)
      resetInvoiceForm()
      resetDetalleItems()
      closeModal()
      return true
    } catch (error) {
      toast.error(error.message || 'No fue posible emitir la factura.')
      return false
    } finally {
      setBusyAction(null)
    }
  }

  const handleSubmit = async () => (modalMode === 'cliente' ? submitCliente() : submitFactura())

  const handleDeleteCliente = async (id) => {
    setBusyAction(`delete-cliente-${id}`)
    try {
      const snapshot = await deleteCliente(id)
      setClientes(snapshot.clientes)
      setFacturas(snapshot.facturas)
      toast.success('Cliente eliminado correctamente.')
    } catch (error) {
      toast.error(error.message || 'No fue posible eliminar el cliente.')
    } finally {
      setBusyAction(null)
    }
  }

  const handleDeleteFactura = async (id) => {
    setBusyAction(`delete-factura-${id}`)
    try {
      const snapshot = await deleteFactura(id)
      setClientes(snapshot.clientes)
      setFacturas(snapshot.facturas)
      toast.success('Factura eliminada correctamente.')
    } catch (error) {
      toast.error(error.message || 'No fue posible eliminar la factura.')
    } finally {
      setBusyAction(null)
    }
  }

  const handleLogout = () => {
    setUserMenuOpen(false)
    toast.info('Has cerrado la sesión del administrador.')
  }

  return {
    currentSection,
    clientes,
    facturas,
    kpis,
    availableClients,
    filteredClients,
    filteredInvoices,
    clienteForm,
    facturaForm,
    detalleForm,
    detalleItems,
    facturaTotals,
    filterEstado,
    searchQuery,
    sidebarOpen,
    userMenuOpen,
    themeMode,
    isModalOpen,
    modalMode,
    isLoading,
    isSubmitting: busyAction !== null,
    showClienteModal: isModalOpen && modalMode === 'cliente',
    showFacturaModal: isModalOpen && modalMode === 'factura',
    facturaEstados: FACTURA_ESTADOS,
    tipoClienteOptions: TIPO_CLIENTE_OPTIONS,
    tipoPagoOptions: TIPO_PAGO_OPTIONS,
    setSidebarOpen,
    setUserMenuOpen,
    setSearchQuery,
    setFilterEstado,
    toggleTheme,
    openClienteModal,
    openFacturaModal,
    closeModal,
    handleClienteFieldChange,
    handleInvoiceFieldChange,
    handleDetalleFieldChange,
    addDetalleItem,
    removeDetalleItem,
    handleSubmit,
    handleDeleteCliente,
    handleDeleteFactura,
    handleLogout,
  }
}
