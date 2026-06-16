// src/routes/cliente.routes.js
//
// Define todos los endpoints REST de la HU1 – Administración de Clientes.
// Todos los endpoints requieren JWT válido (Bearer token del módulo de Seguridad).
//
// Endpoints:
//   POST   /api/clientes              → Registrar nuevo cliente
//   GET    /api/clientes              → Listar/buscar clientes
//   GET    /api/clientes/:id          → Obtener cliente por UUID
//   GET    /api/clientes/cedula/:ced  → Obtener cliente por cédula
//   PUT    /api/clientes/:id          → Actualizar datos del cliente
//   PATCH  /api/clientes/:id/estado   → Activar o inactivar cliente

const { Router } = require('express');
const { verificarToken } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/cliente.controller');

const router = Router();

// Todos los endpoints de clientes requieren autenticación JWT
router.use(verificarToken);

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: API de Administración de Clientes (HU1 – Torres)
 */

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Registrar un nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cedula
 *               - nombre
 *               - fecha_nacimiento
 *               - tipo_cliente
 *               - direccion
 *               - telefono
 *               - email
 *             properties:
 *               cedula:
 *                 type: string
 *                 example: "1712345678"
 *               nombre:
 *                 type: string
 *                 example: "Juan Pérez"
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *               tipo_cliente:
 *                 type: string
 *                 enum: [Contado, Crédito]
 *                 example: "Contado"
 *               direccion:
 *                 type: string
 *                 example: "Av. Amazonas N37-29, Quito"
 *               telefono:
 *                 type: string
 *                 example: "0991234567"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan.perez@email.com"
 *     responses:
 *       201:
 *         description: Cliente registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado (JWT requerido)
 *       409:
 *         description: Cédula ya registrada
 */
router.post('/', ctrl.registrar);

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Listar o buscar clientes
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Búsqueda parcial por nombre (case-insensitive)
 *       - in: query
 *         name: cedula
 *         schema:
 *           type: string
 *         description: Búsqueda exacta por número de cédula
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Activo, Inactivo]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de clientes encontrados
 *       401:
 *         description: No autorizado
 */
router.get('/', ctrl.listar);

/**
 * @swagger
 * /api/clientes/cedula/{cedula}:
 *   get:
 *     summary: Obtener un cliente por su número de cédula
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cedula
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de cédula del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/cedula/:cedula', ctrl.obtenerPorCedula);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Obtener un cliente por UUID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/:id', ctrl.obtenerPorId);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualizar datos de un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *               tipo_cliente:
 *                 type: string
 *                 enum: [Contado, Crédito]
 *               direccion:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cliente no encontrado
 *       409:
 *         description: Cédula ya registrada
 */
router.put('/:id', ctrl.actualizar);

/**
 * @swagger
 * /api/clientes/{id}/estado:
 *   patch:
 *     summary: Activar o inactivar un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [Activo, Inactivo]
 *                 example: "Inactivo"
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       400:
 *         description: Estado inválido o cliente ya en ese estado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cliente no encontrado
 */
router.patch('/:id/estado', ctrl.cambiarEstado);

module.exports = router;
