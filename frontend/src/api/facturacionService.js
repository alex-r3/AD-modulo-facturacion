import { formatCurrencyNumber, normalizeDocument, sanitizeText } from '../utils/validators'

const STORAGE_KEY = 'facturacion-module-state-v2'

const seedState = {
	clientes: [
		{
			id: '11111111-1111-4111-8111-111111111111',
			cedula: '123456789',
			nombre: 'Inversiones Globales S.A.',
			fecha_nacimiento: '1988-04-12',
			tipo_cliente: 'Crédito',
			direccion: 'Calle 123 # 45-67',
			telefono: '+57 312 4556',
			email: 'contacto@inversionesglobales.com',
			estado: 'Activo',
			created_at: '2026-06-01T08:00:00',
			updated_at: '2026-06-01T08:00:00',
		},
		{
			id: '22222222-2222-4222-8222-222222222222',
			cedula: '987654321',
			nombre: 'Tecnologias del Pacifico',
			fecha_nacimiento: '1992-09-03',
			tipo_cliente: 'Contado',
			direccion: 'Carrera 11 # 22-33',
			telefono: '+57 300 1122',
			email: 'facturacion@tecpacifico.com',
			estado: 'Activo',
			created_at: '2026-06-02T08:00:00',
			updated_at: '2026-06-02T08:00:00',
		},
		{
			id: '33333333-3333-4333-8333-333333333333',
			cedula: '555666777',
			nombre: 'Distribuidora Alianza',
			fecha_nacimiento: '1985-01-20',
			tipo_cliente: 'Crédito',
			direccion: 'Av. 5 # 10-15',
			telefono: '+57 315 9090',
			email: 'info@distribuidoraalianza.com',
			estado: 'Inactivo',
			created_at: '2026-06-03T08:00:00',
			updated_at: '2026-06-03T08:00:00',
		},
	],
	facturas: [
		{
			id: 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
			numero_factura: 'ABC-123-123456789',
			cliente_id: '11111111-1111-4111-8111-111111111111',
			clienteNombre: 'Inversiones Globales S.A.',
			tipo_pago: 'Crédito',
			fecha_emision: '2026-06-12',
			subtotal: 4500,
			total_iva: 855,
			total: 5355,
			estado: 'Emitida',
		},
		{
			id: 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
			numero_factura: 'DEF-456-987654321',
			cliente_id: '22222222-2222-4222-8222-222222222222',
			clienteNombre: 'Tecnologias del Pacifico',
			tipo_pago: 'Efectivo',
			fecha_emision: '2026-06-14',
			subtotal: 1200.5,
			total_iva: 228.1,
			total: 1428.6,
			estado: 'Pagada',
		},
	],
	detalle_facturas: [
		{
			id: 'ddddddd1-dddd-4ddd-8ddd-ddddddddddd1',
			factura_id: 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
			producto_id: 'P-001',
			producto_nombre: 'Licencia ERP',
			cantidad: 1,
			precio_unitario: 4500,
			graba_iva: true,
			subtotal_linea: 4500,
		},
		{
			id: 'ddddddd2-dddd-4ddd-8ddd-ddddddddddd2',
			factura_id: 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
			producto_id: 'P-002',
			producto_nombre: 'Soporte mensual',
			cantidad: 2,
			precio_unitario: 600.25,
			graba_iva: true,
			subtotal_linea: 1200.5,
		},
	],
}

const clone = (value) => JSON.parse(JSON.stringify(value))

const createUuid = () => {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID()
	}

	const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
	return template.replace(/[xy]/g, (char) => {
		const random = Math.floor(Math.random() * 16)
		const value = char === 'x' ? random : (random & 0x3) | 0x8
		return value.toString(16)
	})
}

const normalizeState = (parsed) => ({
	clientes: Array.isArray(parsed?.clientes) ? parsed.clientes : [],
	facturas: Array.isArray(parsed?.facturas) ? parsed.facturas : [],
	detalle_facturas: Array.isArray(parsed?.detalle_facturas) ? parsed.detalle_facturas : [],
})

const loadState = () => {
	if (typeof window === 'undefined') {
		return clone(seedState)
	}

	const stored = window.localStorage.getItem(STORAGE_KEY)
	if (!stored) {
		return clone(seedState)
	}

	try {
		return normalizeState(JSON.parse(stored))
	} catch {
		return clone(seedState)
	}
}

const persistState = (state) => {
	if (typeof window === 'undefined') {
		return
	}

	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export async function getFacturacionSnapshot() {
	return clone(loadState())
}

export async function createCliente(input) {
	const state = loadState()
	const cedulaNormalizada = normalizeDocument(input.cedula)

	if (state.clientes.some((cliente) => normalizeDocument(cliente.cedula) === cedulaNormalizada)) {
		throw new Error('Ya existe un cliente con esa cédula.')
	}

	const timestamp = new Date().toISOString()
	const nextState = {
		...state,
		clientes: [
			...state.clientes,
			{
				id: createUuid(),
				cedula: cedulaNormalizada,
				nombre: sanitizeText(input.nombre),
				fecha_nacimiento: sanitizeText(input.fecha_nacimiento),
				tipo_cliente: sanitizeText(input.tipo_cliente),
				direccion: sanitizeText(input.direccion),
				telefono: sanitizeText(input.telefono),
				email: sanitizeText(input.email),
				estado: sanitizeText(input.estado),
				created_at: timestamp,
				updated_at: timestamp,
			},
		],
	}

	persistState(nextState)
	return clone(nextState)
}

export async function createFactura(input) {
	const state = loadState()
	const cliente = state.clientes.find((item) => item.id === input.cliente_id)

	if (!cliente) {
		throw new Error('El cliente seleccionado no existe.')
	}

	const facturaId = createUuid()
	const detalles = Array.isArray(input.detalles) ? input.detalles : []

	const nextState = {
		...state,
		facturas: [
			...state.facturas,
			{
				id: facturaId,
				numero_factura: sanitizeText(input.numero_factura),
				cliente_id: cliente.id,
				clienteNombre: cliente.nombre,
				tipo_pago: sanitizeText(input.tipo_pago),
				fecha_emision: sanitizeText(input.fecha_emision),
				subtotal: formatCurrencyNumber(input.subtotal),
				total_iva: formatCurrencyNumber(input.total_iva),
				total: formatCurrencyNumber(input.total),
				estado: sanitizeText(input.estado),
			},
		],
		detalle_facturas: [
			...state.detalle_facturas,
			...detalles.map((detalle) => ({
				id: createUuid(),
				factura_id: facturaId,
				producto_id: sanitizeText(detalle.producto_id),
				producto_nombre: sanitizeText(detalle.producto_nombre),
				cantidad: Number(detalle.cantidad),
				precio_unitario: formatCurrencyNumber(detalle.precio_unitario),
				graba_iva: Boolean(detalle.graba_iva),
				subtotal_linea: formatCurrencyNumber(detalle.subtotal_linea),
			})),
		],
	}

	persistState(nextState)
	return clone(nextState)
}

export async function deleteCliente(clienteId) {
	const state = loadState()
	const facturasToDelete = state.facturas
		.filter((factura) => factura.cliente_id === clienteId)
		.map((factura) => factura.id)

	const nextState = {
		...state,
		clientes: state.clientes.filter((cliente) => cliente.id !== clienteId),
		facturas: state.facturas.filter((factura) => factura.cliente_id !== clienteId),
		detalle_facturas: state.detalle_facturas.filter((detalle) => !facturasToDelete.includes(detalle.factura_id)),
	}

	persistState(nextState)
	return clone(nextState)
}

export async function deleteFactura(facturaId) {
	const state = loadState()
	const nextState = {
		...state,
		facturas: state.facturas.filter((factura) => factura.id !== facturaId),
		detalle_facturas: state.detalle_facturas.filter((detalle) => detalle.factura_id !== facturaId),
	}

	persistState(nextState)
	return clone(nextState)
}
