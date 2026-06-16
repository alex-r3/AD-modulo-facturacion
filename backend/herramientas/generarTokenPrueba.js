// herramientas/generarTokenPrueba.js
//
// Genera un JWT de prueba con el mismo formato que usará el módulo
// de Seguridad (Django). Ejecutar con: node herramientas/generarTokenPrueba.js
//
// ⚠️ SOLO PARA DESARROLLO LOCAL — no usar en producción.

require('dotenv').config({ path: '../.env' });
const jwt = require('jsonwebtoken');

// Simula el payload que Django/Seguridad pondrá dentro del token.
// ⚠️ Confirmar campos reales con el equipo de Seguridad.
const payload = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // UUID del usuario
  nombre: 'Usuario Prueba',
  rol: 'facturador'
};

const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: '8h',
  algorithm: process.env.JWT_ALGORITHM || 'HS256'
});

console.log('\n✅ TOKEN JWT DE PRUEBA:');
console.log('──────────────────────────────────────────────────────');
console.log(token);
console.log('──────────────────────────────────────────────────────');
console.log('\n📋 Usar en Postman / Apollo Sandbox como header:');
console.log(`Authorization: Bearer ${token}\n`);
