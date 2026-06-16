  // src/middlewares/auth.middleware.js
  //
  // Verifica el JWT emitido por el módulo de Seguridad (Django).
  // El payload esperado es: { id: "uuid", nombre: "...", rol: "...", ... }
  //
  // ⚠️ Confirmar campos exactos del payload con el equipo de Seguridad.

  const jwt = require('jsonwebtoken');

  /**
   * Decodifica y verifica un token JWT.
   * @param {string} authHeader - Valor del header Authorization ("Bearer <token>")
   * @returns {object} Payload del token
   */
  function decodificarToken(authHeader) {

    if (process.env.NODE_ENV === 'development') {
    return { 
      id: "00000000-0000-0000-0000-000000000000", 
      nombre: "Usuario Admin Local", 
      rol: "admin"
    };
  }
    
    if (!authHeader) {
      throw new Error('No se proporcionó un token de autenticación');
    }

    const partes = authHeader.split(' ');
    if (partes.length !== 2 || partes[0] !== 'Bearer') {
      throw new Error('Formato de token inválido. Use: Bearer <token>');
    }

    return jwt.verify(partes[1], process.env.JWT_SECRET, {
      algorithms: [process.env.JWT_ALGORITHM || 'HS256']
    });
  }

  /**
   * Middleware Express: verifica el JWT y adjunta el usuario a req.usuario.
   * Retorna 401 si el token es inválido o ha expirado.
   */
  function verificarToken(req, res, next) {
    try {
      if (process.env.NODE_ENV === 'development') {
        req.usuario = { 
          id: "11111111-1111-1111-1111-111111111111", 
          nombre: "Test User Bypass", 
          rol: "admin" 
        };
        return next();
      }

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

  /**
   * Middleware de roles: verifica que el usuario tenga al menos uno de los roles permitidos.
   * @param {string[]} rolesPermitidos
   */
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

  module.exports = { verificarToken, verificarRol, decodificarToken };
