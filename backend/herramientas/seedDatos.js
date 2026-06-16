// herramientas/seedDatos.js
// Inserta un cliente de prueba en la BD para poder probar Facturación.
// Ejecutar: node herramientas/seedDatos.js

require('dotenv').config({ path: '../.env' });
const { sequelize } = require('../src/config/db');

async function seed() {
  await sequelize.authenticate();

  await sequelize.query(`
    INSERT INTO clientes (id, cedula, nombre, fecha_nacimiento, tipo_cliente, direccion, telefono, email, estado)
    VALUES (
      'c1d2e3f4-aaaa-bbbb-cccc-dd1234567890',
      '0102030405',
      'Cliente de Prueba',
      '1990-06-15',
      'Contado',
      'Av. Principal 123',
      '0991234567',
      'prueba@email.com',
      'Activo'
    )
    ON CONFLICT (cedula) DO NOTHING;
  `);

  console.log('\n✅ Cliente de prueba listo en la BD.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('cliente_id: c1d2e3f4-aaaa-bbbb-cccc-dd1234567890');
  console.log('\n📦 Productos reales disponibles en Inventario:');
  console.log('   PRD-0003 → Licencia Office 365  | pvp: $65.00  | graba_iva: false');
  console.log('   PRD-0005 → Monitor Samsung 24"  | pvp: $160.00 | graba_iva: true');
  console.log('   PRD-0002 → Mouse Inalámbrico    | pvp: $25.00  | graba_iva: true');
  console.log('   PRD-0004 → Teclado Mecánico RGB | pvp: $80.00  | graba_iva: true');
  console.log('   PRD-0006 → Televisión TCL 65"   | pvp: $650.00 | graba_iva: true');
  console.log('\n📋 Mutation de prueba para crear factura:');
  console.log(`
mutation {
  crearFactura(input: {
    clienteId: "c1d2e3f4-aaaa-bbbb-cccc-dd1234567890",
    tipoPago: "Efectivo",
    detalles: [
      { productoCodigo: "PRD-0003", cantidad: 2 },
      { productoCodigo: "PRD-0002", cantidad: 1 }
    ]
  }) {
    numeroFactura
    subtotal
    totalIva
    total
    detalles {
      productoNombre
      cantidad
      precioUnitario
      grabaIva
      subtotalLinea
    }
  }
}
  `);

  await sequelize.close();
}

seed().catch((err) => {
  console.error('Error en seed:', err.message);
  process.exit(1);
});
