// generar-token.js
// Script para generar un JWT de prueba sin necesidad del módulo de Seguridad.
// Útil para probar los endpoints en local.
//
// Uso: node generar-token.js

require('dotenv').config();
const jwt = require('jsonwebtoken');
const fs = require('fs');

if (!process.env.JWT_SECRET) {
  console.error('❌ No se encontró JWT_SECRET en el archivo .env');
  process.exit(1);
}

const payload = {
  id: '00000000-0000-0000-0000-000000000001',
  nombre: 'Torres',
  rol: 'admin'
};

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

// Guardar en archivo para copiar fácilmente sin riesgo de truncado
fs.writeFileSync('token.txt', token, 'utf-8');

console.log('\n✅ Token JWT generado (válido por 8 horas)');
console.log('📄 Guardado en: backend/token.txt');
console.log('\n👉 Ábrelo, copia TODO el contenido y pégalo en Swagger Authorize\n');
