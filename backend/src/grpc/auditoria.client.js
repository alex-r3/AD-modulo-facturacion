// src/grpc/auditoria.client.js
// Cliente gRPC hacia Seguridad. Nunca bloquea la app si falla.
// Reemplazar auditoria.proto cuando Seguridad confirme su contrato real.

const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = path.join(__dirname, 'auditoria.proto');
let client = null;

function obtenerCliente() {
  if (client) return client;
  try {
    const pkgDef = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
    });
    const proto = grpc.loadPackageDefinition(pkgDef)['auditoria'];
    client = new proto['AuditoriaService'](
      process.env.MODULO_SEGURIDAD_GRPC_URL,
      grpc.credentials.createInsecure()
    );
    return client;
  } catch (err) {
    console.error('⚠️ No se pudo inicializar cliente gRPC:', err.message);
    return null;
  }
}

function registrarEvento({ accion, usuarioId, entidadId, detalle }) {
  const c = obtenerCliente();
  if (!c) return;

  const meta = new grpc.Metadata();
  meta.add('x-api-key', process.env.API_KEY_AUDITORIA || '');

  c['RegistrarEvento'](
    {
      modulo_origen: 'facturacion',
      accion,
      usuario_id: String(usuarioId ?? ''),
      entidad_id: String(entidadId ?? ''),
      detalle: detalle ?? '',
      timestamp: new Date().toISOString()
    },
    meta,
    (err, resp) => {
      if (err) {
        console.error('⚠️ Error gRPC auditoría:', err.message);
        return;
      }
      console.log(`📋 Auditoría gRPC: ${accion} — ${resp?.mensaje || 'ok'}`);
    }
  );
}

module.exports = { registrarEvento };
