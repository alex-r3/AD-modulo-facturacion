// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./graphql/typeDefs');
const facturaResolvers = require('./graphql/resolvers/factura.resolver');
const clienteResolvers = require('./graphql/resolvers/cliente.resolver');
const { obtenerUsuarioDesdeToken } = require('./middlewares/auth.middleware');

// Merge de resolvers: combina queries y mutations de ambos módulos
const resolvers = {
  Query: {
    ...facturaResolvers.Query,
    ...clienteResolvers.Query
  },
  Mutation: {
    ...facturaResolvers.Mutation,
    ...clienteResolvers.Mutation
  }
};
const { verificarApiKey } = require('./middlewares/apiKey.middleware');

// Definir relación Factura ↔ Cliente (misma BD)
const Factura = require('./models/factura.model');
const Cliente = require('./models/cliente.model');
Factura.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Cliente.hasMany(Factura, { foreignKey: 'cliente_id', as: 'facturas' });

async function crearApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // ── Health check ────────────────────────────────────────────────────────
  app.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok', servicio: 'modulo-facturacion' });
  });

  // ── REST: webhook que Inventario llama con API-Key ───────────────────────
  app.post('/api/inventario/webhooks/producto-actualizado', verificarApiKey, (req, res) => {
    const { codigo, nombre, pvp, stock_actual } = req.body;
    console.log(`📦 Producto actualizado por Inventario: ${codigo} (${nombre}) pvp=${pvp} stock=${stock_actual}`);
    res.status(200).json({ recibido: true });
  });

  // ── REST: endpoint que CXC puede consultar con API-Key ──────────────────
  const facturaService = require('./services/factura.service');
  app.get('/api/cxc/facturas/:id', verificarApiKey, async (req, res) => {
    try {
      const f = await facturaService.obtenerFacturaPorId(req.params.id);
      const data = f.toJSON();
      res.status(200).json({
        id: data.id,
        numeroFactura: data.numero_factura,
        clienteId: data.cliente_id,
        tipoPago: data.tipo_pago,
        total: data.total,
        estado: data.estado,
        fechaEmision: data.fecha_emision
      });
    } catch (err) {
      res.status(err.codigo || 500).json({ error: err.message });
    }
  });

  // ── Apollo Server (GraphQL) ──────────────────────────────────────────────
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const authHeader = req.headers.authorization;
      return {
        usuario: obtenerUsuarioDesdeToken(authHeader),
        token: authHeader
      };
    },
    formatError: (err) => {
      console.error('GraphQL Error:', err.message);
      return { message: err.message };
    }
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  // ── 404 y error global ──────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({ error: `Ruta ${req.method} ${req.originalUrl} no encontrada` });
  });
  app.use((err, req, res, next) => {
    console.error('Error no controlado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  return app;
}

module.exports = crearApp;
