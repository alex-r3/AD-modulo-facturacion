// src/models/detalleFactura.model.js
//
// CAMBIO CONFIRMADO: producto_id es STRING tipo "PRD-0003", NO UUID.
// Inventario usa sus propios códigos (PRD-XXXX), no UUIDs.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Factura = require('./factura.model');

const DetalleFactura = sequelize.define('DetalleFactura', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  factura_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'facturas', key: 'id' },
    onDelete: 'CASCADE'
  },
  producto_id: {
    type: DataTypes.STRING(20),   // ej: "PRD-0003" — confirmado por Inventario
    allowNull: false,
    comment: 'Código del producto en Inventario (ej: PRD-0003)'
  },
  producto_nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Snapshot del nombre al momento de facturar'
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 }
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0 }
  },
  graba_iva: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  subtotal_linea: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0 }
  }
}, {
  tableName: 'detalle_facturas',
  timestamps: false
});

Factura.hasMany(DetalleFactura, { foreignKey: 'factura_id', as: 'detalles', onDelete: 'CASCADE' });
DetalleFactura.belongsTo(Factura, { foreignKey: 'factura_id', as: 'factura' });

module.exports = DetalleFactura;
