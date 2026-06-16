// server.js — Entry point del módulo de Administración de Clientes
//
// Flujo de inicio:
//   1. Conectar a PostgreSQL
//   2. Sincronizar tabla clientes (ALTER para no destruir datos existentes)
//   3. Sincronizar tabla pistas_auditoria (si no existe)
//   4. Arrancar el servidor HTTP

require('dotenv').config();

const crearApp = require('./src/app');
const { sequelize, probarConexion } = require('./src/config/db');

// Registrar modelos para que Sequelize los conozca antes de sincronizar
require('./src/models/cliente.model');
require('./src/models/pistaAuditoria.model');

const PORT = process.env.PORT || 3001;

async function iniciar() {
  // 1. Verificar conexión a Postgres
  await probarConexion();

  // 2. Sincronizar SOLO las tablas que este módulo gestiona:
  //    - clientes        (dueño: módulo de Clientes/Torres)
  //    - pistas_auditoria (compartida, se crea si no existe)
  //
  // Usamos { alter: true } para ajustar columnas sin borrar datos.
  await sequelize.sync({ alter: true });
  console.log('✅ Tabla "clientes" sincronizada correctamente.');

  // 3. Arrancar la app Express
  const app = crearApp();

  app.listen(PORT, () => {
    console.log(`🚀 Módulo de Clientes en http://localhost:${PORT}`);
    console.log(`   Swagger Docs:  http://localhost:${PORT}/api/docs`);
    console.log(`   Health check:  http://localhost:${PORT}/health`);
    console.log(`   Ambiente:      ${process.env.NODE_ENV || 'development'}`);
  });
}

iniciar().catch((err) => {
  console.error('❌ Error al iniciar el servidor:', err);
  process.exit(1);
});
