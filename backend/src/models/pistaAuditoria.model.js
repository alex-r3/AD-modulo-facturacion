// src/models/pistaAuditoria.model.js
//
// Tabla de auditoría local: registra todas las acciones importantes
// sobre clientes (crear, editar, activar, inactivar).
//
// IMPORTANTE: Esta tabla pertenece a la BD compartida del proyecto.
// El módulo de Facturación también tiene su propia tabla pistas_auditoria
// para los eventos de facturación. Ambas conviven en la misma BD.

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
    comment: 'Ej: CLIENTE_CREADO, CLIENTE_ACTUALIZADO, CLIENTE_INACTIVADO'
  },
  detalles: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'JSON con información adicional del evento'
  }
}, {
  tableName: 'pistas_auditoria',
  timestamps: false
});

module.exports = PistaAuditoria;
