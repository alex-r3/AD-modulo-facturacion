const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DOCUMENT_REGEX = /^[0-9]{6,15}$/
const INVOICE_NUMBER_REGEX = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{9}$/
const PHONE_REGEX = /^[+0-9()\-\s]{7,20}$/

export const CLIENTE_ESTADOS = ['Activo', 'Inactivo']
export const TIPO_CLIENTE_OPTIONS = ['Contado', 'Crédito']
export const FACTURA_ESTADOS = ['Emitida', 'Pagada', 'Anulada']
export const TIPO_PAGO_OPTIONS = ['Efectivo', 'Crédito']
export const IVA_PERCENT = 19

export const sanitizeText = (value) => String(value ?? '').trim()

export const normalizeDocument = (value) => sanitizeText(value).replace(/\s+/g, '')

export const toNumber = (value) => Number(String(value ?? '').replace(',', '.'))

export const parseBoolean = (value) => value === true || value === 'true' || value === 1 || value === '1'

const countDigits = (value) => (String(value ?? '').match(/\d/g) ?? []).length

const isValidEmail = (value) => EMAIL_REGEX.test(sanitizeText(value))

const isValidDocument = (value) => DOCUMENT_REGEX.test(normalizeDocument(value))

const isValidInvoiceNumber = (value) => INVOICE_NUMBER_REGEX.test(sanitizeText(value))

const isValidPhone = (value) => PHONE_REGEX.test(sanitizeText(value)) && countDigits(value) >= 7

const isValidPastOrTodayDate = (value) => {
  if (!value) {
    return false
  }

  const parsedDate = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return parsedDate.getTime() <= today.getTime()
}

export const getFirstError = (errors) => Object.values(errors).find(Boolean) || ''

export const validateClienteForm = (form, existingClientes = []) => {
  const values = {
    cedula: sanitizeText(form.cedula),
    nombre: sanitizeText(form.nombre),
    fecha_nacimiento: sanitizeText(form.fecha_nacimiento),
    tipo_cliente: sanitizeText(form.tipo_cliente),
    direccion: sanitizeText(form.direccion),
    telefono: sanitizeText(form.telefono),
    email: sanitizeText(form.email),
    estado: sanitizeText(form.estado),
  }

  const errors = {}

  if (!isValidDocument(values.cedula)) {
    errors.cedula = 'La cédula debe contener solo dígitos y tener entre 6 y 15 caracteres.'
  }

  if (existingClientes.some((cliente) => normalizeDocument(cliente.cedula) === normalizeDocument(values.cedula))) {
    errors.cedula = 'Ya existe un cliente con esa cédula.'
  }

  if (values.nombre.length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres.'
  }

  if (!isValidPastOrTodayDate(values.fecha_nacimiento)) {
    errors.fecha_nacimiento = 'La fecha de nacimiento no puede ser mayor a la fecha actual.'
  }

  if (!TIPO_CLIENTE_OPTIONS.includes(values.tipo_cliente)) {
    errors.tipo_cliente = 'Selecciona un tipo de cliente válido.'
  }

  if (values.direccion.length < 5) {
    errors.direccion = 'La dirección debe tener al menos 5 caracteres.'
  }

  if (!isValidPhone(values.telefono)) {
    errors.telefono = 'El teléfono debe contener al menos 7 dígitos válidos.'
  }

  if (!isValidEmail(values.email)) {
    errors.email = 'Ingresa un correo electrónico válido.'
  }

  if (!CLIENTE_ESTADOS.includes(values.estado)) {
    errors.estado = 'Selecciona un estado válido.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values,
  }
}

export const validateDetalleFacturaForm = (form) => {
  const values = {
    producto_id: sanitizeText(form.producto_id),
    producto_nombre: sanitizeText(form.producto_nombre),
    cantidad: Number(form.cantidad),
    precio_unitario: toNumber(form.precio_unitario),
    graba_iva: parseBoolean(form.graba_iva),
  }

  const errors = {}

  if (!values.producto_id) {
    errors.producto_id = 'El producto es obligatorio.'
  }

  if (values.producto_nombre.length < 3) {
    errors.producto_nombre = 'El nombre del producto debe tener al menos 3 caracteres.'
  }

  if (!Number.isInteger(values.cantidad) || values.cantidad <= 0) {
    errors.cantidad = 'La cantidad debe ser un entero mayor a cero.'
  }

  if (!Number.isFinite(values.precio_unitario) || values.precio_unitario < 0) {
    errors.precio_unitario = 'El precio unitario debe ser un número mayor o igual a cero.'
  }

  if (Object.keys(errors).length > 0) {
    return {
      valid: false,
      errors,
      values,
    }
  }

  return {
    valid: true,
    errors,
    values: {
      ...values,
      subtotal_linea: Number((values.cantidad * values.precio_unitario).toFixed(2)),
    },
  }
}

export const calculateFacturaTotals = (detalles = []) => {
  const subtotal = detalles.reduce((accumulator, detalle) => accumulator + Number(detalle.subtotal_linea || 0), 0)
  const totalIva = detalles.reduce(
    (accumulator, detalle) => accumulator + (detalle.graba_iva ? Number(detalle.subtotal_linea || 0) * (IVA_PERCENT / 100) : 0),
    0,
  )

  return {
    subtotal: Number(subtotal.toFixed(2)),
    total_iva: Number(totalIva.toFixed(2)),
    total: Number((subtotal + totalIva).toFixed(2)),
  }
}

export const validateFacturaForm = (form, clientes = [], facturas = [], detalles = []) => {
  const values = {
    numero_factura: sanitizeText(form.numero_factura),
    cliente_id: sanitizeText(form.cliente_id),
    tipo_pago: sanitizeText(form.tipo_pago),
    fecha_emision: sanitizeText(form.fecha_emision),
    estado: sanitizeText(form.estado),
  }

  const errors = {}

  if (!isValidInvoiceNumber(values.numero_factura)) {
    errors.numero_factura = 'El número de factura debe tener el formato XXX-XXX-XXXXXXXXX.'
  } else if (facturas.some((factura) => factura.numero_factura === values.numero_factura)) {
    errors.numero_factura = 'Ya existe una factura con ese número.'
  }

  if (!values.cliente_id) {
    errors.cliente_id = 'Debes seleccionar un cliente.'
  } else if (!clientes.some((cliente) => cliente.id === values.cliente_id)) {
    errors.cliente_id = 'El cliente seleccionado no existe.'
  }

  if (!TIPO_PAGO_OPTIONS.includes(values.tipo_pago)) {
    errors.tipo_pago = 'Selecciona un tipo de pago válido.'
  }

  if (!values.fecha_emision) {
    errors.fecha_emision = 'La fecha de emisión es obligatoria.'
  }

  if (!FACTURA_ESTADOS.includes(values.estado)) {
    errors.estado = 'Selecciona un estado válido.'
  }

  if (!Array.isArray(detalles) || detalles.length === 0) {
    errors.detalles = 'Debes agregar al menos un detalle de factura.'
  }

  const duplicatesInDetails = detalles.some(
    (detalle, index) => detalles.findIndex((candidate) => candidate.producto_id === detalle.producto_id) !== index,
  )

  if (duplicatesInDetails) {
    errors.detalles = 'No puedes repetir el mismo producto en el detalle.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values,
  }
}

export const formatCurrencyNumber = (value) => Number((Number(value) || 0).toFixed(2))
