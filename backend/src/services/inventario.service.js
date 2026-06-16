// src/services/inventario.service.js
//
// Cliente REST hacia el MÓDULO DE INVENTARIO.
//
// API real confirmada: https://api-inventario-v1gh.onrender.com
// Documentación:       https://api-inventario-v1gh.onrender.com/api/docs/
//
// Endpoints que usamos:
//   GET /api/productos/{codigo}   → obtener un producto por su código (PRD-XXXX)
//   GET /api/productos/catalogo   → catálogo de productos activos
//
// Respuesta real confirmada por el equipo:
// {
//   "success": true,
//   "data": [{
//     "codigo": "PRD-0003",
//     "nombre": "Licencia Office 365",
//     "descripcion": "Suscripción anual digital",
//     "stock_actual": 100,
//     "pvp": "65.00",          ← string, hay que convertir a número
//     "graba_iva": false,
//     "porcentaje_iva_aplicado": 0   ← si graba_iva=false viene 0
//   }]
// }
//
// IMPORTANTE: el porcentaje_iva_aplicado ya viene del servidor (15 o 0).
// No lo hardcodeamos aquí — usamos el valor que manda Inventario.

const axios = require('axios');

const INVENTARIO_URL = process.env.MODULO_INVENTARIO_REST_URL;

// Creamos un cliente axios con la URL base y timeout configurado
const clienteHttp = axios.create({
  baseURL: INVENTARIO_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Obtiene un producto por su código (ej: "PRD-0003") desde Inventario.
 * El token JWT se reenvía para que Inventario valide que el usuario
 * está autenticado.
 *
 * @param {string} codigo - Código del producto (ej: "PRD-0003")
 * @param {string} token  - "Bearer xxx"
 * @returns {Promise<object>} producto con: codigo, nombre, pvp (number),
 *                            graba_iva, porcentaje_iva_aplicado, stock_actual
 */
async function obtenerProductoPorCodigo(codigo, token) {
  try {
    const respuesta = await clienteHttp.get(`/productos/${codigo}`, {
      headers: { Authorization: token }
    });

    // La API devuelve { success: true, data: { ...producto } }
    // o { success: true, data: [...] } según el endpoint
    const producto = respuesta.data?.data;

    if (!producto) {
      const error = new Error(`Producto "${codigo}" no encontrado en Inventario`);
      error.codigo = 404;
      throw error;
    }

    // Normalizar: pvp viene como string "65.00", lo convertimos a número
    return {
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      pvp: parseFloat(producto.pvp),
      graba_iva: producto.graba_iva,
      porcentaje_iva_aplicado: producto.porcentaje_iva_aplicado ?? 0,
      stock_actual: producto.stock_actual,
      estado: producto.estado
    };
  } catch (error) {
    if (error.codigo) throw error;

    if (error.response?.status === 404) {
      const e = new Error(`Producto "${codigo}" no existe en Inventario`);
      e.codigo = 404;
      throw e;
    }

    if (error.response?.status === 401) {
      const e = new Error('Token inválido al consultar Inventario');
      e.codigo = 401;
      throw e;
    }

    const e = new Error(`No se pudo conectar con el módulo de Inventario: ${error.message}`);
    e.codigo = 503;
    throw e;
  }
}

/**
 * Obtiene el catálogo completo de productos activos.
 * Útil para el frontend de Facturación al momento de seleccionar
 * productos para agregar a la factura.
 *
 * @param {string} token - "Bearer xxx"
 * @returns {Promise<Array>} lista de productos activos normalizados
 */
async function obtenerCatalogo(token) {
  try {
    const respuesta = await clienteHttp.get('/productos/catalogo', {
      headers: { Authorization: token }
    });

    const productos = respuesta.data?.data ?? [];

    // Normalizar todos los productos (pvp viene como string)
    return productos.map((p) => ({
      codigo: p.codigo,
      nombre: p.nombre,
      descripcion: p.descripcion,
      pvp: parseFloat(p.pvp),
      graba_iva: p.graba_iva,
      porcentaje_iva_aplicado: p.porcentaje_iva_aplicado ?? 0,
      stock_actual: p.stock_actual
    }));
  } catch (error) {
    console.error('⚠️ No se pudo obtener el catálogo de Inventario:', error.message);
    return [];
  }
}

/**
 * Descuenta stock en Inventario tras emitir una factura.
 * ⚠️ Revisar si Inventario tiene un endpoint para esto.
 * Por ahora no está en la documentación visible — confirmar con el equipo.
 * Dejamos la función como placeholder (best effort, no bloquea).
 *
 * @param {string} codigo   - Código del producto
 * @param {number} cantidad - Unidades vendidas
 * @param {string} token    - "Bearer xxx"
 */
async function descontarStock(codigo, cantidad, token) {
  // ⚠️ PENDIENTE: confirmar con Inventario si tienen un endpoint
  // para descontar stock, y cuál es su ruta/método.
  // Opciones comunes:
  //   PATCH /api/productos/{codigo}/stock  { cantidad: -N }
  //   POST  /api/movimientos               { codigo, tipo: 'salida', cantidad }
  //
  // Por ahora solo lo logueamos para no bloquear la factura.
  console.log(`📦 [PENDIENTE] Descontar stock: ${codigo} x${cantidad} — confirmar endpoint con Inventario`);
}

module.exports = { obtenerProductoPorCodigo, obtenerCatalogo, descontarStock };
