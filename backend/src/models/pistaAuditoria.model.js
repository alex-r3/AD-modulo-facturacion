// src/models/pistaAuditoria.model.js
//
// Tabla local de auditoría. Cada acción importante en Facturación
// (crear factura, anular factura, etc.) genera un registro aquí.
//
// Campos:
//   - usuario_id: UUID del usuario (viene del payload del JWT de Seguridad)
//   - accion: texto descriptivo ('FACTURA_CREADA', 'FACTURA_ANULADA', etc.)
//   - detalles: JSONB — Postgres permite guardar un objeto JSON completo.
//     Útil para registrar qué cambió exactamente (ej: estado anterior/nuevo,
//     número de factura, monto total, etc.)
//
// Nota: esta tabla está en la misma BD de Facturación, no en Seguridad.
// Si el módulo de Seguridad también quiere registrar estos eventos vía gRPC,
// lo harán en su propia BD. Nosotros guardamos la nuestra copia local.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PistaAuditoria = sequelize.define('PistaAuditoria', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'UUID del usuario autenticado (del payload JWT de Seguridad)'
  },
  fecha_hora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  accion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Ej: FACTURA_CREADA, FACTURA_ANULADA, FACTURA_PAGADA'
  },
  detalles: {
    type: DataTypes.JSONB, // solo disponible en Postgres
    allowNull: true,
    comment: 'JSON con información adicional del evento (número factura, total, etc.)'
  }
}, {
  tableName: 'pistas_auditoria',
  timestamps: false // la fecha la manejamos con fecha_hora
});

module.exports = PistaAuditoria;
