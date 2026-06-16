// src/app.js
//
// Configura Express, CORS, Morgan, rutas REST y Swagger UI.

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const clienteRoutes = require('./routes/cliente.routes');

// ── Configuración de Swagger ─────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Administración de Clientes',
      version: '1.0.0',
      description: `
**HU1 – Administración de Clientes** — Módulo de Facturación

Endpoints para registrar, consultar, editar y activar/inactivar clientes.

### Autenticación
Todos los endpoints requieren un **JWT válido** en el header:
\`Authorization: Bearer <token>\`

El token lo emite el **módulo de Seguridad (Django)**.

### Responsable
Torres — Backend & API
      `.trim()
    },
    servers: [
      // En producción (Render), usa la URL pública automática
      ...(process.env.RENDER_EXTERNAL_URL
        ? [{ url: process.env.RENDER_EXTERNAL_URL, description: 'Servidor en producción (Render)' }]
        : []
      ),
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: 'Servidor local de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT emitido por el módulo de Seguridad'
        }
      }
    }
  },
  apis: ['./src/routes/*.routes.js'] // leer JSDoc de las rutas
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

// ── App ───────────────────────────────────────────────────────────────────────
function crearApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // ── Health check (sin autenticación) ────────────────────────────────────
  app.get('/health', (_, res) => {
    res.status(200).json({
      status: 'ok',
      servicio: 'modulo-clientes',
      timestamp: new Date().toISOString()
    });
  });

  // ── Swagger UI ───────────────────────────────────────────────────────────
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'API Clientes – Módulo Facturación',
    swaggerOptions: {
      persistAuthorization: true  // el token se mantiene entre recargas
    }
  }));

  // ── Rutas REST ───────────────────────────────────────────────────────────
  app.use('/api/clientes', clienteRoutes);

  // ── 404 ──────────────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      error: 'No encontrado',
      mensaje: `Ruta ${req.method} ${req.originalUrl} no existe`
    });
  });

  // ── Error global ─────────────────────────────────────────────────────────
  app.use((err, req, res, next) => {
    console.error('Error no controlado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  return app;
}

module.exports = crearApp;
