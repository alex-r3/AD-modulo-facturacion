// src/models/cliente.model.js
//
// Refleja EXACTAMENTE la tabla SQL de la HU1 – Administración de Clientes.
// Este módulo es el DUEÑO de la tabla clientes: la crea y la gestiona.
//
// La tabla es compartida con el módulo de Facturación (que solo la lee
// para JOINs, sin sincronizarla desde su lado).

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    comment: 'Identificador único del cliente (UUID generado automáticamente)'
  },
  cedula: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: {
      name: 'unique_cedula',
      msg: 'Ya existe un cliente registrado con esa cédula'
    },
    validate: {
      notEmpty: { msg: 'La cédula no puede estar vacía' },
      len: {
        args: [5, 15],
        msg: 'La cédula debe tener entre 5 y 15 caracteres'
      }
    }
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre no puede estar vacío' },
      len: {
        args: [2, 255],
        msg: 'El nombre debe tener al menos 2 caracteres'
      }
    }
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notNull: { msg: 'La fecha de nacimiento es requerida' },
      isBefore: {
        args: new Date().toISOString().split('T')[0],
        msg: 'La fecha de nacimiento no puede ser mayor a la fecha actual'
      },
      isDate: { msg: 'Formato de fecha inválido (use YYYY-MM-DD)' }
    }
  },
  tipo_cliente: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: {
        args: [['Contado', 'Crédito']],
        msg: "El tipo de cliente debe ser 'Contado' o 'Crédito'"
      }
    }
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La dirección no puede estar vacía' }
    }
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El teléfono no puede estar vacío' }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: { msg: 'El email no tiene un formato válido' },
      notEmpty: { msg: 'El email no puede estar vacío' }
    }
  },
  estado: {
    type: DataTypes.STRING(15),
    allowNull: false,
    defaultValue: 'Activo',
    validate: {
      isIn: {
        args: [['Activo', 'Inactivo']],
        msg: "El estado debe ser 'Activo' o 'Inactivo'"
      }
    }
  }
}, {
  tableName: 'clientes',
  timestamps: true,       // genera created_at y updated_at
  underscored: true       // convierte camelCase a snake_case en la BD
});

module.exports = Cliente;
