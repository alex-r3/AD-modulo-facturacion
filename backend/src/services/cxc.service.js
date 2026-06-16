// src/services/cxc.service.js
const axios = require('axios');
const CXC_REST_URL = process.env.MODULO_CXC_REST_URL;

async function registrarCuentaPorCobrar(factura, token) {
  try {
    await axios.post(
      `${CXC_REST_URL}/cuentas-por-cobrar`,
      {
        factura_id: factura.id,
        numero_factura: factura.numero_factura,
        cliente_id: factura.cliente_id,
        tipo_pago: factura.tipo_pago,
        total: factura.total,
        fecha_emision: factura.fecha_emision
      },
      { headers: { Authorization: token }, timeout: 5000 }
    );
  } catch (error) {
    console.error('⚠️ No se pudo registrar cuenta por cobrar en CXC:', error.message);
  }
}

module.exports = { registrarCuentaPorCobrar };
