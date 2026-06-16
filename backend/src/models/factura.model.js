// src/models/factura.model.js
//
// Refleja exactamente la tabla facturas del SQL compartido.
// Cambios clave vs versiones anteriores:
//   - id: UUID (no INTEGER autoincremental)
//   - cliente_id: UUID con FK real a clientes(id) — misma BD
//   - tipo_pago: 'Efectivo' o 'Crédito' (nuevo campo)
//   - estado: VARCHAR (no ENUM de Postgres para mayor flexibilidad)
//   - numero_factura: formato XXX-XXX-XXXXXXXXX

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Factura = sequelize.define('Factura', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  numero_factura: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Formato: XXX-XXX-XXXXXXXXX (ej: 001-001-000000001)'
  },
  cliente_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clientes', // nombre de la tabla (string, no el modelo)
      key: 'id'
    }
  },
  tipo_pago: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['Efectivo', 'Crédito']]
    }
  },
  fecha_emision: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },
  total_iva: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Emitida'
  }
}, {
  tableName: 'facturas',
  timestamps: false // el SQL original no tiene created_at/updated_at en facturas
});

module.exports = Factura;
