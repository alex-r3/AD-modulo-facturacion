// src/graphql/typeDefs.js
const { gql } = require('apollo-server-express');

const typeDefs = gql`

  # ── CLIENTES ────────────────────────────────────────────────────────────────

  type Cliente {
    id: ID!
    cedula: String!
    nombre: String!
    fechaNacimiento: String!
    tipoCliente: String!       # 'Contado' o 'Crédito'
    direccion: String!
    telefono: String!
    email: String!
    estado: String!            # 'Activo' o 'Inactivo'
  }

  type ClienteResumen {
    id: ID!
    nombre: String!
    cedula: String!
    tipoCliente: String!
  }

  # Resultado de búsqueda: incluye mensaje cuando no hay resultados (CA1 HU2)
  type BusquedaClienteResult {
    resultados: [Cliente!]!
    mensaje: String            # "No se encontraron resultados" si lista vacía
  }

  # Respuesta de mutaciones de cliente con mensaje de éxito (CA4 HU1)
  type ClienteResponse {
    cliente: Cliente!
    mensaje: String!
  }

  input CrearClienteInput {
    cedula:          String!
    nombre:          String!
    fechaNacimiento: String!   # formato YYYY-MM-DD
    tipoCliente:     String!   # 'Contado' o 'Crédito'
    direccion:       String!
    telefono:        String!
    email:           String!
    estado:          String    # defecto: 'Activo'
  }

  input ActualizarClienteInput {
    cedula:          String
    nombre:          String
    fechaNacimiento: String
    tipoCliente:     String
    direccion:       String
    telefono:        String
    email:           String
    estado:          String    # 'Activo' o 'Inactivo' — CA3 HU1
  }

  # ── FACTURAS ─────────────────────────────────────────────────────────────────

  type DetalleFactura {
    id: ID!
    productoCodigo: String!
    productoNombre: String!
    cantidad: Int!
    precioUnitario: Float!
    grabaIva: Boolean!
    subtotalLinea: Float!
  }

  type Factura {
    id: ID!
    numeroFactura: String!
    clienteId: String!
    cliente: ClienteResumen
    tipoPago: String!
    fechaEmision: String!
    subtotal: Float!
    totalIva: Float!
    total: Float!
    estado: String!
    detalles: [DetalleFactura!]!
  }

  type PistaAuditoria {
    id: ID!
    usuarioId: String!
    fechaHora: String!
    accion: String!
    detalles: String
  }

  type ProductoCatalogo {
    codigo: String!
    nombre: String!
    descripcion: String
    pvp: Float!
    grabaIva: Boolean!
    porcentajeIvaAplicado: Int!
    stockActual: Int!
  }

  input DetalleInput {
    productoCodigo: String!
    cantidad: Int!
  }

  input CrearFacturaInput {
    clienteId: String!
    tipoPago: String!          # 'Efectivo' o 'Crédito'
    detalles: [DetalleInput!]!
  }

  # ── QUERIES ──────────────────────────────────────────────────────────────────

  type Query {
    # Clientes
    clientes(estado: String): [Cliente!]!
    cliente(id: ID!): Cliente
    buscarClientes(termino: String!): BusquedaClienteResult!

    # Facturas
    facturas(estado: String, clienteId: String, tipoPago: String): [Factura!]!
    factura(id: ID!): Factura

    # Inventario (catálogo en tiempo real)
    catalogoProductos: [ProductoCatalogo!]!

    # Auditoría
    pistasAuditoria(accion: String): [PistaAuditoria!]!
  }

  # ── MUTATIONS ────────────────────────────────────────────────────────────────

  type Mutation {
    # Clientes (HU1)
    crearCliente(input: CrearClienteInput!): ClienteResponse!
    actualizarCliente(id: ID!, input: ActualizarClienteInput!): ClienteResponse!

    # Facturas
    crearFactura(input: CrearFacturaInput!): Factura!
    actualizarEstadoFactura(id: ID!, estado: String!): Factura!
  }
`;

module.exports = typeDefs;
