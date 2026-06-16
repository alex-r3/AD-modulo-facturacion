// server.js
require('dotenv').config();

const crearApp = require('./src/app');
const { sequelize, probarConexion } = require('./src/config/db');

// Registrar modelos propios (Facturación gestiona estas tablas)
require('./src/models/factura.model');
require('./src/models/detalleFactura.model');
require('./src/models/pistaAuditoria.model');

// Registrar modelo de Clientes SIN sincronizarlo (lo gestiona el otro módulo)
require('./src/models/cliente.model');

const PORT = process.env.PORT || 3003;

async function iniciar() {
  await probarConexion();

  // Solo sincronizamos las tablas propias de Facturación.
  // La tabla 'clientes' ya existe (creada por el módulo de Clientes),
  // y Sequelize la usará para JOINs sin intentar crearla/modificarla.
  await sequelize.sync({ alter: true });
  console.log('✅ Tablas de Facturación sincronizadas (facturas, detalle_facturas, pistas_auditoria).');

  const app = await crearApp();

  app.listen(PORT, () => {
    console.log(`🚀 Módulo de Facturación en http://localhost:${PORT}`);
    console.log(`   GraphQL Playground: http://localhost:${PORT}/graphql`);
    console.log(`   Health check:       http://localhost:${PORT}/health`);
  });
}

iniciar().catch((err) => {
  console.error('Error al iniciar:', err);
  process.exit(1);
});
