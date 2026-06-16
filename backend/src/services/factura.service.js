// src/services/factura.service.js
//
// Lógica de negocio principal.
//
// CAMBIO IMPORTANTE respecto a versiones anteriores:
// El porcentaje de IVA ya NO se hardcodea aquí.
// Inventario devuelve `porcentaje_iva_aplicado` (0 o 15) por cada producto.
// Usamos ese valor directamente para calcular el IVA de cada línea.

const { sequelize } = require('../config/db');
const Factura = require('../models/factura.model');
const DetalleFactura = require('../models/detalleFactura.model');
const Cliente = require('../models/cliente.model');
const PistaAuditoria = require('../models/pistaAuditoria.model');

const inventarioService = require('./inventario.service');
const cxcService = require('./cxc.service');
const auditoriaService = require('./auditoria.service');
const auditoriaGrpc = require('../grpc/auditoria.client');

/**
 * Genera número de factura formato XXX-XXX-XXXXXXXXX
 * Ej: 001-001-000000001
 */
async function generarNumeroFactura() {
  const ultima = await Factura.findOne({ order: [['fecha_emision', 'DESC']] });
  let secuencia = 1;
  if (ultima) {
    const partes = ultima.numero_factura.split('-');
    secuencia = parseInt(partes[2], 10) + 1;
  }
  return `001-001-${String(secuencia).padStart(9, '0')}`;
}

/**
 * Crea una factura completa.
 *
 * @param {object} datos
 * @param {string} datos.cliente_id - UUID del cliente (FK real en BD)
 * @param {string} datos.tipo_pago  - 'Efectivo' o 'Crédito'
 * @param {Array}  datos.detalles   - [{ producto_codigo: "PRD-0003", cantidad: 2 }]
 * @param {object} usuario          - payload del JWT
 * @param {string} token            - "Bearer xxx" para reenviar a Inventario
 */
async function crearFactura(datos, usuario, token) {
  const { cliente_id, tipo_pago, detalles } = datos;

  if (!detalles || detalles.length === 0) {
    const error = new Error('La factura debe tener al menos un producto');
    error.codigo = 400;
    throw error;
  }

  // 1. Consultar cada producto en Inventario (REST real)
  //    El porcentaje_iva_aplicado ya viene del servidor (0 o 15)
  let subtotal = 0;
  let total_iva = 0;
  const detallesConDatos = [];

  for (const item of detalles) {
    const producto = await inventarioService.obtenerProductoPorCodigo(
      item.producto_codigo,
      token
    );

    // Validar que el producto esté disponible
    if (producto.estado && producto.estado.toLowerCase() === 'inactivo') {
      const error = new Error(`El producto "${producto.nombre}" no está disponible`);
      error.codigo = 400;
      throw error;
    }

    // Validar stock
    if (producto.stock_actual < item.cantidad) {
      const error = new Error(
        `Stock insuficiente para "${producto.nombre}" ` +
        `(disponible: ${producto.stock_actual}, solicitado: ${item.cantidad})`
      );
      error.codigo = 400;
      throw error;
    }

    const precio_unitario = producto.pvp; // ya viene como número desde el service
    const subtotal_linea = Number((precio_unitario * item.cantidad).toFixed(2));

    // IVA por línea: usamos porcentaje_iva_aplicado que viene de Inventario
    // (0 si graba_iva=false, 15 si graba_iva=true)
    const porcentaje = producto.porcentaje_iva_aplicado / 100;
    const iva_linea = Number((subtotal_linea * porcentaje).toFixed(2));

    subtotal += subtotal_linea;
    total_iva += iva_linea;

    detallesConDatos.push({
      producto_id: producto.codigo,      // "PRD-0003" (string, no UUID)
      producto_nombre: producto.nombre,  // snapshot histórico
      cantidad: item.cantidad,
      precio_unitario,
      graba_iva: producto.graba_iva,
      subtotal_linea
    });
  }

  subtotal = Number(subtotal.toFixed(2));
  total_iva = Number(total_iva.toFixed(2));
  const total = Number((subtotal + total_iva).toFixed(2));
  const numero_factura = await generarNumeroFactura();

  // 2. Guardar todo en una transacción (factura + detalles + auditoría local)
  const resultado = await sequelize.transaction(async (t) => {
    const nuevaFactura = await Factura.create({
      numero_factura,
      cliente_id,
      tipo_pago,
      subtotal,
      total_iva,
      total,
      estado: 'Emitida'
    }, { transaction: t });

    const detallesCreados = await Promise.all(
      detallesConDatos.map((d) =>
        DetalleFactura.create({ ...d, factura_id: nuevaFactura.id }, { transaction: t })
      )
    );

    // Auditoría local dentro de la transacción
    await PistaAuditoria.create({
      usuario_id: usuario.id,
      accion: 'FACTURA_CREADA',
      detalles: {
        numero_factura,
        cliente_id,
        tipo_pago,
        subtotal,
        total_iva,
        total,
        productos: detallesConDatos.map((d) => ({
          codigo: d.producto_id,
          nombre: d.producto_nombre,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          graba_iva: d.graba_iva,
          subtotal_linea: d.subtotal_linea
        }))
      }
    }, { transaction: t });

    return { factura: nuevaFactura, detalles: detallesCreados };
  });

  const facturaCompleta = {
    ...resultado.factura.toJSON(),
    detalles: resultado.detalles.map((d) => d.toJSON())
  };

  // 3. Descontar stock en Inventario (best effort — pendiente confirmar endpoint)
  for (const item of detalles) {
    await inventarioService.descontarStock(item.producto_codigo, item.cantidad, token);
  }

  // 4. Notificar a CXC (best effort)
  await cxcService.registrarCuentaPorCobrar(facturaCompleta, token);

  // 5. Auditoría gRPC a Seguridad (best effort, placeholder)
  auditoriaGrpc.registrarEvento({
    accion: 'FACTURA_CREADA',
    usuarioId: usuario.id,
    entidadId: facturaCompleta.id,
    detalle: `Factura ${numero_factura} - Total: ${total}`
  });

  return facturaCompleta;
}

async function listarFacturas(filtros = {}) {
  const where = {};
  if (filtros.estado) where.estado = filtros.estado;
  if (filtros.cliente_id) where.cliente_id = filtros.cliente_id;
  if (filtros.tipo_pago) where.tipo_pago = filtros.tipo_pago;

  return Factura.findAll({
    where,
    include: [
      { model: DetalleFactura, as: 'detalles' },
      { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'cedula', 'tipo_cliente'] }
    ],
    order: [['fecha_emision', 'DESC']]
  });
}

async function obtenerFacturaPorId(id) {
  const factura = await Factura.findByPk(id, {
    include: [
      { model: DetalleFactura, as: 'detalles' },
      { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'cedula', 'tipo_cliente'] }
    ]
  });

  if (!factura) {
    const error = new Error('Factura no encontrada');
    error.codigo = 404;
    throw error;
  }

  return factura;
}

async function actualizarEstadoFactura(id, nuevoEstado, usuario) {
  const factura = await obtenerFacturaPorId(id);
  const estadoAnterior = factura.estado;

  if (estadoAnterior === 'Anulada') {
    const error = new Error('No se puede modificar una factura anulada');
    error.codigo = 400;
    throw error;
  }

  factura.estado = nuevoEstado;
  await factura.save();

  await auditoriaService.registrarAuditoria({
    usuarioId: usuario.id,
    accion: nuevoEstado === 'Anulada' ? 'FACTURA_ANULADA' : 'FACTURA_ACTUALIZADA',
    detalles: {
      factura_id: factura.id,
      numero_factura: factura.numero_factura,
      estado_anterior: estadoAnterior,
      estado_nuevo: nuevoEstado
    }
  });

  auditoriaGrpc.registrarEvento({
    accion: nuevoEstado === 'Anulada' ? 'FACTURA_ANULADA' : 'FACTURA_ACTUALIZADA',
    usuarioId: usuario.id,
    entidadId: factura.id,
    detalle: `${factura.numero_factura}: ${estadoAnterior} → ${nuevoEstado}`
  });

  return factura;
}

module.exports = {
  crearFactura,
  listarFacturas,
  obtenerFacturaPorId,
  actualizarEstadoFactura
};
