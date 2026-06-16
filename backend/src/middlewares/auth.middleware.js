// src/middlewares/auth.middleware.js
//
// El JWT del módulo de Seguridad (Django) viene con usuario_id como UUID.
// Adaptamos la extracción del payload para reflejar eso.

const jwt = require('jsonwebtoken');

function decodificarToken(authHeader) {
  if (!authHeader) throw new Error('No se proporcionó un token de autenticación');

  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    throw new Error('Formato de token inválido. Use: Bearer <token>');
  }

  return jwt.verify(partes[1], process.env.JWT_SECRET, {
    algorithms: [process.env.JWT_ALGORITHM || 'HS256']
  });
  // Payload esperado del módulo de Seguridad (Django):
  // { id: "uuid-del-usuario", nombre: "...", rol: "...", iat: ..., exp: ... }
  // ⚠️ Confirmar campos exactos con el equipo de Seguridad
}

function verificarToken(req, res, next) {
  try {
    req.usuario = decodificarToken(req.headers['authorization']);
    next();
  } catch (error) {
    const mensaje =
      error.name === 'TokenExpiredError'
        ? 'La sesión ha expirado, inicie sesión nuevamente'
        : error.message;
    return res.status(401).json({ error: 'No autorizado', mensaje });
  }
}

function obtenerUsuarioDesdeToken(authHeader) {
  try {
    return decodificarToken(authHeader);
  } catch {
    return null;
  }
}

function verificarRol(rolesPermitidos = []) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: 'Prohibido',
        mensaje: 'No tiene permisos suficientes para esta acción'
      });
    }
    next();
  };
}

module.exports = { verificarToken, verificarRol, obtenerUsuarioDesdeToken, decodificarToken };
