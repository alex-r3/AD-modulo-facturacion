import { normalizeDocument, sanitizeText } from '../utils/validators'

const GRAPHQL_URL = 'http://localhost:3003/graphql'

/**
 * Función centralizada para enviar queries y mutations al servidor GraphQL.
 * Maneja automáticamente la inyección del token JWT en las cabeceras.
 */
async function fetchGraphQL(query, variables = {}, token = '') {
    const headers = {
        'Content-Type': 'application/json',
		'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImExYjJjM2Q0LWU1ZjYtNzg5MC1hYmNkLWVmMTIzNDU2Nzg5MCIsIm5vbWJyZSI6IlVzdWFyaW8gUHJ1ZWJhIiwicm9sIjoiZmFjdHVyYWRvciIsImlhdCI6MTc4MTYyNTQ2NiwiZXhwIjoxNzgxNzExODY2fQ.0_hZvhMkQXnYm9JFPtJWp6O7MT1Lz_stuTgPFPwGTYo'
    }
    
    if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`
    }

    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables })
    })

    const json = await response.json()
    
    if (json.errors) {
        throw new Error(json.errors[0].message || 'Error en la petición GraphQL')
    }
    
    return json.data
}

/**
 * Reemplaza la carga local y emula el snapshot combinando
 * las consultas de clientes y facturas de la base de datos real.
 */
export async function getFacturacionSnapshot(token = '') {
    const query = `
        query GetSnapshot {
            clientes {
                id
                cedula
                nombre
                fechaNacimiento
                tipoCliente
                direccion
                telefono
                email
                estado
                createdAt
                updatedAt
            }
            facturas {
                id
                numeroFactura
                clienteId
                tipoPago
                fechaEmision
                subtotal
                totalIva
                total
                estado
                detalles {
                    id
                    productoCodigo
                    productoNombre
                    cantidad
                    precioUnitario
                    grabaIva
                    subtotalLinea
                }
            }
        }
    `
    const data = await fetchGraphQL(query, {}, token)
    
    // Mapeamos de vuelta a la estructura que tu UI espera (snake_case)
    return {
        clientes: (data.clientes || []).map(c => ({
            id: c.id,
            cedula: c.cedula,
            nombre: c.nombre,
            fecha_nacimiento: c.fechaNacimiento,
            tipo_cliente: c.tipoCliente,
            direccion: c.direccion,
            telefono: c.telefono,
            email: c.email,
            estado: c.estado,
            created_at: c.createdAt,
            updated_at: c.updatedAt
        })),
        facturas: (data.facturas || []).map(f => ({
            id: f.id,
            numero_factura: f.numeroFactura,
            cliente_id: f.clienteId,
            tipo_pago: f.tipoPago,
            fecha_emision: f.fechaEmision,
            subtotal: f.subtotal,
            total_iva: f.totalIva,
            total: f.total,
            estado: f.estado
        })),
        // Los detalles se extraen de manera aplanada si tu UI del snapshot los requiere de forma global
        detalle_facturas: (data.facturas || []).reduce((acc, f) => {
            const lineas = (f.detalles || []).map(d => ({
                id: d.id,
                factura_id: f.id,
                producto_id: d.productoCodigo,
                producto_nombre: d.productoNombre,
                cantidad: d.cantidad,
                precio_unitario: d.precioUnitario,
                graba_iva: d.grabaIva,
                subtotal_linea: d.subtotalLinea
            }))
            return [...acc, ...lineas]
        }, [])
    }
}

/**
 * HU1 - CA4: Registrar un nuevo cliente en el sistema a través de GraphQL.
 */
export async function createCliente(input, token = '') {
    const mutation = `
        mutation RegistrarCliente($input: CrearClienteInput!) {
            crearCliente(input: $input) {
                id
            }
        }
    `
    
    const variables = {
        input: {
            cedula: normalizeDocument(input.cedula),
            nombre: sanitizeText(input.nombre),
            fechaNacimiento: sanitizeText(input.fecha_nacimiento || input.fechaNacimiento),
            tipoCliente: sanitizeText(input.tipo_cliente || input.tipoCliente),
            direccion: sanitizeText(input.direccion),
            telefono: sanitizeText(input.telefono),
            email: sanitizeText(input.email),
            estado: sanitizeText(input.estado || 'Activo')
        }
    }

    await fetchGraphQL(mutation, variables, token)
    return getFacturacionSnapshot(token)
}




/**
 * Generar una factura real procesando detalles estructurados desde la API.
 */
export async function createFactura(input, token = '') {
    const mutation = `
        mutation RegistrarFactura($input: CrearFacturaInput!) {
            crearFactura(input: $input) {
                id
            }
        }
    `

    const detallesInput = (input.detalles || []).map(d => ({
        productoCodigo: sanitizeText(d.producto_id || d.productoCodigo),
        cantidad: Number(d.cantidad)
    }))

    const variables = {
        input: {
            clienteId: input.cliente_id || input.clienteId,
            tipoPago: sanitizeText(input.tipo_pago || input.tipoPago),
            detalles: detallesInput
        }
    }

    await fetchGraphQL(mutation, variables, token)
    return getFacturacionSnapshot(token)
}

/**
 * HU1 - CA3: Inactivar cliente (Mutación corregida sin el error de sintaxis).
 */
export async function deleteCliente(clienteId, token = '') {
    const mutation = `
        mutation DeshabilitarCliente($id: ID!) {
            inactivarCliente(id: $id) {
                id
                estado
            }
        }
    `
    
    await fetchGraphQL(mutation, { id: clienteId }, token)
    return getFacturacionSnapshot(token)
}

/**
 * Cambia el estado de una factura a 'Anulada' de acuerdo con tu esquema de base de datos.
 */
export async function deleteFactura(facturaId, token = '') {
    const mutation = `
        mutation AnularFactura($id: ID!, $estado: String!) {
            actualizarEstadoFactura(id: $id, estado: $estado) {
                id
                estado
            }
        }
    `
    
    await fetchGraphQL(mutation, { id: facturaId, estado: 'Anulada' }, token)
    return getFacturacionSnapshot(token)
}