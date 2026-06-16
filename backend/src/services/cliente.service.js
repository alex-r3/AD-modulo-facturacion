// src/services/cliente.service.js
//
// Lógica de negocio para la administración de clientes.
// Cubre HU1: crear, buscar, actualizar e inactivar clientes.
//
// REGLAS DE NEGOCIO:
//   - No se elimina físicamente un cliente (CA3 HU1): se cambia estado a 'Inactivo'
//   - La cédula debe ser única (CA2 HU1)
//   - Todas las validaciones de formato se manejan en el modelo (Sequelize)

const { Op } = require('sequelize');
const Cliente = require('../models/cliente.model');
const PistaAuditoria = require('../models/pistaAuditoria.model');
const auditoriaGrpc = require('../grpc/auditoria.client');

/**
 * Registra un nuevo cliente en la BD de Facturación.
 * CA4 HU1: guarda el registro y retorna mensaje de éxito.
 * CA2 HU1: lanza error si la cédula ya existe.
 *
 * @param {object} datos  - campos del cliente
 * @param {object} usuario - payload del JWT
 */
async function crearCliente(datos, usuario) {
  // CA2: verificar cédula duplicada
  const existe = await Cliente.findOne({ where: { cedula: datos.cedula } });
  if (existe) {
    const error = new Error(`Ya existe un cliente con la cédula ${datos.cedula}`);
    error.codigo = 409;
    throw error;
  }

  const cliente = await Cliente.create({
    cedula:           datos.cedula,
    nombre:           datos.nombre,
    fecha_nacimiento: datos.fecha_nacimiento,
    tipo_cliente:     datos.tipo_cliente,
    direccion:        datos.direccion,
    telefono:         datos.telefono,
    email:            datos.email,
    estado:           datos.estado || 'Activo'
  });

  // Auditoría local
  await _auditoria(usuario.id, 'CLIENTE_CREADO', {
    cliente_id: cliente.id,
    cedula: cliente.cedula,
    nombre: cliente.nombre
  });

  // Auditoría gRPC a Seguridad (best effort)
  auditoriaGrpc.registrarEvento({
    accion: 'CLIENTE_CREADO',
    usuarioId: usuario.id,
    entidadId: cliente.id,
    detalle: `Cliente ${cliente.cedula} - ${cliente.nombre}`
  });

  return cliente;
}

/**
 * Busca clientes por cédula o nombre (búsqueda parcial, case-insensitive).
 * CA1 HU2: retorna coincidencias o lista vacía (el resolver muestra el mensaje).
 *
 * @param {string} termino - texto a buscar (cédula o nombre)
 */
async function buscarClientes(termino) {
  if (!termino || termino.trim() === '') {
    const error = new Error('Debe ingresar un término de búsqueda');
    error.codigo = 400;
    throw error;
  }

  const clientes = await Cliente.findAll({
    where: {
      estado: 'Activo',
      [Op.or]: [
        { cedula: { [Op.iLike]: `%${termino}%` } },
        { nombre:  { [Op.iLike]: `%${termino}%` } }
      ]
    },
    order: [['nombre', 'ASC']],
    limit: 20
  });

  return clientes;
}

/**
 * Obtiene un cliente por su ID (UUID).
 */
async function obtenerClientePorId(id) {
  const cliente = await Cliente.findByPk(id);
  if (!cliente) {
    const error = new Error('Cliente no encontrado');
    error.codigo = 404;
    throw error;
  }
  return cliente;
}

/**
 * Actualiza los datos de un cliente existente.
 * CA3 HU1: si estado pasa a 'Inactivo', NO elimina — solo actualiza.
 *
 * @param {string} id     - UUID del cliente
 * @param {object} datos  - campos a actualizar
 * @param {object} usuario - payload del JWT
 */
async function actualizarCliente(id, datos, usuario) {
  const cliente = await obtenerClientePorId(id);

  // Verificar cédula duplicada si se está cambiando
  if (datos.cedula && datos.cedula !== cliente.cedula) {
    const existe = await Cliente.findOne({ where: { cedula: datos.cedula } });
    if (existe) {
      const error = new Error(`Ya existe un cliente con la cédula ${datos.cedula}`);
      error.codigo = 409;
      throw error;
    }
  }

  const camposActualizables = [
    'cedula', 'nombre', 'fecha_nacimiento',
    'tipo_cliente', 'direccion', 'telefono', 'email', 'estado'
  ];

  camposActualizables.forEach((campo) => {
    if (datos[campo] !== undefined) cliente[campo] = datos[campo];
  });

  await cliente.save();

  // Auditoría
  const accion = datos.estado === 'Inactivo' ? 'CLIENTE_INACTIVADO' : 'CLIENTE_ACTUALIZADO';
  await _auditoria(usuario.id, accion, {
    cliente_id: cliente.id,
    cedula: cliente.cedula,
    nombre: cliente.nombre,
    cambios: datos
  });

  auditoriaGrpc.registrarEvento({
    accion,
    usuarioId: usuario.id,
    entidadId: cliente.id,
    detalle: `Cliente ${cliente.cedula} - ${cliente.nombre}`
  });

  return cliente;
}

/**
 * Lista todos los clientes (con filtro opcional de estado).
 */
async function listarClientes(estado) {
  const where = {};
  if (estado) where.estado = estado;
  return Cliente.findAll({ where, order: [['nombre', 'ASC']] });
}

// ── Helper privado ──────────────────────────────────────────────────────────
async function _auditoria(usuarioId, accion, detalles) {
  try {
    await PistaAuditoria.create({ usuario_id: usuarioId, accion, detalles });
  } catch (err) {
    console.error(`⚠️ Auditoría [${accion}] falló:`, err.message);
  }
}

module.exports = { crearCliente, buscarClientes, obtenerClientePorId, actualizarCliente, listarClientes };
