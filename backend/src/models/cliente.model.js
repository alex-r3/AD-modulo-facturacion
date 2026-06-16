// src/models/cliente.model.js
//
// Este modelo refleja EXACTAMENTE la tabla que definió el equipo
// de Administración de Clientes (Torres, Ramírez, Gómez, Colta).
//
// Facturación NO crea ni edita clientes — eso lo hace el módulo de
// Clientes. Aquí solo necesitamos el modelo para:
//   1. Que Sequelize reconozca la FK cliente_id en facturas
//   2. Poder hacer JOINs al consultar facturas (traer nombre del cliente)
//
// IMPORTANTE: NO llamamos al módulo de Clientes por HTTP para validar
// si el cliente existe — la FK real en Postgres lo hace automáticamente
// (lanzará un error de FK si cliente_id no existe en la tabla clientes).

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  cedula: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  tipo_cliente: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['Contado', 'Crédito']]
    }
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING(15),
    allowNull: false,
    defaultValue: 'Activo',
    validate: {
      isIn: [['Activo', 'Inactivo']]
    }
  }
}, {
  tableName: 'clientes',
  timestamps: true,
  underscored: true,
  // No permitir que Sequelize sincronice esta tabla:
  // la gestiona el módulo de Clientes, no nosotros.
  // (en sync() ignoraremos este modelo)
});

module.exports = Cliente;
