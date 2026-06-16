// src/services/auditoria.service.js
//
// Como la tabla pistas_auditoria está en la misma BD de Facturación,
// registramos los eventos directamente aquí (Sequelize), sin gRPC.
//
// El cliente gRPC (src/grpc/auditoria.client.js) sigue disponible
// para cuando el equipo de Seguridad confirme que también quieren
// recibir esos eventos en su módulo. Ambas cosas pueden coexistir.
//
// Esta función es "fire and forget" (no lanza error si falla) para
// que un problema de auditoría no bloquee la operación principal.

const PistaAuditoria = require('../models/pistaAuditoria.model');

/**
 * Registra un evento de auditoría en la tabla pistas_auditoria.
 *
 * @param {object} datos
 * @param {string} datos.usuarioId - UUID del usuario (del JWT)
 * @param {string} datos.accion    - 'FACTURA_CREADA', 'FACTURA_ANULADA', etc.
 * @param {object} datos.detalles  - objeto libre que se guarda como JSONB
 */
async function registrarAuditoria({ usuarioId, accion, detalles }) {
  try {
    await PistaAuditoria.create({
      usuario_id: usuarioId,
      accion,
      detalles: detalles || null
    });
  } catch (error) {
    // No propagamos el error — la auditoría no debe bloquear la operación
    console.error(`⚠️ No se pudo registrar auditoría [${accion}]:`, error.message);
  }
}

module.exports = { registrarAuditoria };
