// src/middlewares/apiKey.middleware.js
const { verificarApiKey } = (() => {
  function verificarApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ error: 'No autorizado', mensaje: 'Falta el header x-api-key' });
    }
    if (apiKey !== process.env.API_KEY_FACTURACION) {
      return res.status(403).json({ error: 'Prohibido', mensaje: 'API-Key inválida' });
    }
    next();
  }
  return { verificarApiKey };
})();

module.exports = { verificarApiKey };
