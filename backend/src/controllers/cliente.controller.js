// src/controllers/cliente.controller.js
//
// Capa HTTP: recibe requests, delega al service y devuelve respuestas.
// No contiene lógica de negocio — esa vive en cliente.service.js.

const clienteService = require('../services/cliente.service');

/**
 * POST /api/clientes
 * Registra un nuevo cliente.
 */
async function registrar(req, res) {
  try {
    const cliente = await clienteService.registrarCliente(req.body, req.usuario);
    return res.status(201).json({
      mensaje: 'Cliente registrado exitosamente',
      data: cliente
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: error.errors.map((e) => e.message).join('; ')
      });
    }
    return res.status(error.codigo || 500).json({
      error: error.codigo === 409 ? 'Conflicto' : 'Error',
      mensaje: error.message
    });
  }
}

/**
 * GET /api/clientes
 * Lista clientes con filtros opcionales por ?nombre=, ?cedula=, ?estado=
 */
async function listar(req, res) {
  try {
    const { nombre, cedula, estado } = req.query;
    const clientes = await clienteService.listarClientes({ nombre, cedula, estado });
    return res.status(200).json({
      total: clientes.length,
      data: clientes
    });
  } catch (error) {
    return res.status(error.codigo || 500).json({
      error: 'Error',
      mensaje: error.message
    });
  }
}

/**
 * GET /api/clientes/:id
 * Obtiene un cliente por UUID.
 */
async function obtenerPorId(req, res) {
  try {
    const cliente = await clienteService.obtenerClientePorId(req.params.id);
    return res.status(200).json({ data: cliente });
  } catch (error) {
    return res.status(error.codigo || 500).json({
      error: error.codigo === 404 ? 'No encontrado' : 'Error',
      mensaje: error.message
    });
  }
}

/**
 * GET /api/clientes/cedula/:cedula
 * Obtiene un cliente por número de cédula.
 */
async function obtenerPorCedula(req, res) {
  try {
    const cliente = await clienteService.obtenerClientePorCedula(req.params.cedula);
    return res.status(200).json({ data: cliente });
  } catch (error) {
    return res.status(error.codigo || 500).json({
      error: error.codigo === 404 ? 'No encontrado' : 'Error',
      mensaje: error.message
    });
  }
}

/**
 * PUT /api/clientes/:id
 * Actualiza los datos de un cliente.
 */
async function actualizar(req, res) {
  try {
    const cliente = await clienteService.actualizarCliente(
      req.params.id,
      req.body,
      req.usuario
    );
    return res.status(200).json({
      mensaje: 'Cliente actualizado exitosamente',
      data: cliente
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: error.errors.map((e) => e.message).join('; ')
      });
    }
    return res.status(error.codigo || 500).json({
      error: 'Error',
      mensaje: error.message
    });
  }
}

/**
 * PATCH /api/clientes/:id/estado
 * Activa o inactiva un cliente. Body: { estado: "Activo" | "Inactivo" }
 */
async function cambiarEstado(req, res) {
  try {
    const { estado } = req.body;
    if (!estado) {
      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: 'El campo "estado" es requerido en el body'
      });
    }
    const cliente = await clienteService.cambiarEstadoCliente(
      req.params.id,
      estado,
      req.usuario
    );
    return res.status(200).json({
      mensaje: `Cliente ${estado === 'Inactivo' ? 'inactivado' : 'activado'} exitosamente`,
      data: cliente
    });
  } catch (error) {
    return res.status(error.codigo || 500).json({
      error: 'Error',
      mensaje: error.message
    });
  }
}

module.exports = { registrar, listar, obtenerPorId, obtenerPorCedula, actualizar, cambiarEstado };
