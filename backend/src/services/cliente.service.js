// src/services/cliente.service.js
//
// Lógica de negocio para la Administración de Clientes (HU1 – Torres).
//
// Operaciones:
//   - registrarCliente   → POST /api/clientes
//   - listarClientes     → GET  /api/clientes
//   - obtenerPorId       → GET  /api/clientes/:id
//   - obtenerPorCedula   → GET  /api/clientes/cedula/:cedula
//   - actualizarCliente  → PUT  /api/clientes/:id
//   - cambiarEstado      → PATCH /api/clientes/:id/estado
//
// Todas las mutaciones registran pistas de auditoría en la BD.

const { Op } = require('sequelize');
const Cliente = require('../models/cliente.model');
const PistaAuditoria = require('../models/pistaAuditoria.model');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Lanza un error con código HTTP adjunto.
 */
function crearError(mensaje, codigo) {
  const e = new Error(mensaje);
  e.codigo = codigo;
  return e;
}

/**
 * Registra una pista de auditoría (fire-and-forget, no bloquea la operación).
 */
async function registrarAuditoria({ usuarioId, accion, detalles }) {
  try {
    await PistaAuditoria.create({
      usuario_id: usuarioId,
      accion,
      detalles: detalles || null
    });
  } catch (error) {
    console.error(`⚠️ No se pudo registrar auditoría [${accion}]:`, error.message);
  }
}

// ── Servicio ─────────────────────────────────────────────────────────────────

/**
 * Registra un nuevo cliente en la BD.
 *
 * @param {object} datos   - Campos del cliente (cedula, nombre, fecha_nacimiento, etc.)
 * @param {object} usuario - Payload del JWT (para auditoría)
 * @returns {Promise<Cliente>}
 */
async function registrarCliente(datos, usuario) {
  // Verificar cédula duplicada con mensaje claro
  const existente = await Cliente.findOne({ where: { cedula: datos.cedula } });
  if (existente) {
    throw crearError(
      `Ya existe un cliente registrado con la cédula "${datos.cedula}"`,
      409
    );
  }

  const nuevoCliente = await Cliente.create({
    cedula:           datos.cedula,
    nombre:           datos.nombre,
    fecha_nacimiento: datos.fecha_nacimiento,
    tipo_cliente:     datos.tipo_cliente,
    direccion:        datos.direccion,
    telefono:         datos.telefono,
    email:            datos.email,
    estado:           'Activo'  // siempre inicia activo
  });

  await registrarAuditoria({
    usuarioId: usuario.id,
    accion: 'CLIENTE_CREADO',
    detalles: {
      cliente_id: nuevoCliente.id,
      cedula:     nuevoCliente.cedula,
      nombre:     nuevoCliente.nombre,
      tipo_cliente: nuevoCliente.tipo_cliente
    }
  });

  return nuevoCliente;
}

/**
 * Lista clientes con filtros opcionales.
 *
 * @param {object} filtros - { nombre?, cedula?, estado? }
 * @returns {Promise<Cliente[]>}
 */
async function listarClientes(filtros = {}) {
  const where = {};

  if (filtros.nombre) {
    where.nombre = { [Op.iLike]: `%${filtros.nombre}%` }; // búsqueda parcial, case-insensitive
  }
  if (filtros.cedula) {
    where.cedula = filtros.cedula; // cédula exacta
  }
  if (filtros.estado) {
    where.estado = filtros.estado;
  }

  return Cliente.findAll({
    where,
    order: [['nombre', 'ASC']]
  });
}

/**
 * Obtiene un cliente por su UUID.
 *
 * @param {string} id - UUID del cliente
 * @returns {Promise<Cliente>}
 */
async function obtenerClientePorId(id) {
  const cliente = await Cliente.findByPk(id);
  if (!cliente) {
    throw crearError('Cliente no encontrado', 404);
  }
  return cliente;
}

/**
 * Obtiene un cliente por su número de cédula (búsqueda exacta).
 *
 * @param {string} cedula
 * @returns {Promise<Cliente>}
 */
async function obtenerClientePorCedula(cedula) {
  const cliente = await Cliente.findOne({ where: { cedula } });
  if (!cliente) {
    throw crearError(`No se encontró un cliente con la cédula "${cedula}"`, 404);
  }
  return cliente;
}

/**
 * Actualiza los datos editables de un cliente.
 * Solo permite modificar: nombre, fecha_nacimiento, tipo_cliente,
 * direccion, telefono, email. NO permite cambiar cédula ni estado.
 *
 * @param {string} id     - UUID del cliente
 * @param {object} datos  - Campos a actualizar
 * @param {object} usuario - Payload JWT
 * @returns {Promise<Cliente>}
 */
async function actualizarCliente(id, datos, usuario) {
  const cliente = await obtenerClientePorId(id);

  // Si intenta cambiar cédula a una ya existente, verificar
  if (datos.cedula && datos.cedula !== cliente.cedula) {
    const duplicado = await Cliente.findOne({ where: { cedula: datos.cedula } });
    if (duplicado) {
      throw crearError(
        `Ya existe un cliente registrado con la cédula "${datos.cedula}"`,
        409
      );
    }
  }

  const camposPermitidos = [
    'cedula', 'nombre', 'fecha_nacimiento', 'tipo_cliente',
    'direccion', 'telefono', 'email'
  ];

  const datosAntes = { ...cliente.toJSON() };

  camposPermitidos.forEach((campo) => {
    if (datos[campo] !== undefined) {
      cliente[campo] = datos[campo];
    }
  });

  await cliente.save();

  await registrarAuditoria({
    usuarioId: usuario.id,
    accion: 'CLIENTE_ACTUALIZADO',
    detalles: {
      cliente_id: cliente.id,
      cedula:     cliente.cedula,
      cambios: camposPermitidos.reduce((acc, campo) => {
        if (datos[campo] !== undefined && datos[campo] !== datosAntes[campo]) {
          acc[campo] = { antes: datosAntes[campo], despues: datos[campo] };
        }
        return acc;
      }, {})
    }
  });

  return cliente;
}

/**
 * Activa o inactiva un cliente.
 * Un cliente inactivo solo puede cambiar a activo, y viceversa.
 *
 * @param {string} id          - UUID del cliente
 * @param {string} nuevoEstado - 'Activo' o 'Inactivo'
 * @param {object} usuario     - Payload JWT
 * @returns {Promise<Cliente>}
 */
async function cambiarEstadoCliente(id, nuevoEstado, usuario) {
  if (!['Activo', 'Inactivo'].includes(nuevoEstado)) {
    throw crearError("El estado debe ser 'Activo' o 'Inactivo'", 400);
  }

  const cliente = await obtenerClientePorId(id);

  if (cliente.estado === nuevoEstado) {
    throw crearError(
      `El cliente ya se encuentra en estado "${nuevoEstado}"`,
      400
    );
  }

  const estadoAnterior = cliente.estado;
  cliente.estado = nuevoEstado;
  await cliente.save();

  const accion = nuevoEstado === 'Inactivo' ? 'CLIENTE_INACTIVADO' : 'CLIENTE_ACTIVADO';

  await registrarAuditoria({
    usuarioId: usuario.id,
    accion,
    detalles: {
      cliente_id:      cliente.id,
      cedula:          cliente.cedula,
      nombre:          cliente.nombre,
      estado_anterior: estadoAnterior,
      estado_nuevo:    nuevoEstado
    }
  });

  return cliente;
}

module.exports = {
  registrarCliente,
  listarClientes,
  obtenerClientePorId,
  obtenerClientePorCedula,
  actualizarCliente,
  cambiarEstadoCliente
};
