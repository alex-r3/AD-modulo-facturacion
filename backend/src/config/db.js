// src/config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

async function probarConexion() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a Postgres establecida correctamente.');
  } catch (error) {
    console.error('❌ No se pudo conectar a Postgres:', error.message);
  }
}

module.exports = { sequelize, probarConexion };
