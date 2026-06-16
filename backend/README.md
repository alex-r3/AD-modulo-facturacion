# Módulo de Facturación (v3 — con datos reales del equipo)

---

## ¿Qué cambió respecto a la versión anterior?

| Cambio | Detalle |
|---|---|
| IDs → UUID | `id`, `cliente_id`, `usuario_id`, `producto_id` son todos UUID |
| MySQL → Postgres | Igual que el resto del proyecto |
| Clientes en la MISMA BD | `cliente_id` es FK real: Postgres valida la existencia automáticamente |
| `graba_iva` por producto | El IVA se calcula línea por línea según el campo del producto en Inventario |
| `tipo_pago` | Nuevo campo: 'Efectivo' o 'Crédito' |
| `producto_nombre` guardado | Snapshot histórico del nombre al momento de facturar |
| `pistas_auditoria` local | Tabla en la misma BD; ya no depende solo de gRPC |
| Número de factura | Formato: `001-001-000000001` (XXX-XXX-XXXXXXXXX) |
| Productos del modelo real | `codigo`, `nombre`, `pvp`, `graba_iva`, `estado`, `stock_actual` |

---

## Estructura del proyecto

```
modulo-facturacion/
├── src/
│   ├── config/
│   │   └── db.js                       # Conexión Postgres
│   ├── middlewares/
│   │   ├── auth.middleware.js          # JWT de Seguridad
│   │   └── apiKey.middleware.js        # API-Key para módulos
│   ├── models/
│   │   ├── cliente.model.js            # Solo para JOINs (tabla del otro módulo)
│   │   ├── factura.model.js            # UUID, tipo_pago, FK a clientes
│   │   ├── detalleFactura.model.js     # UUID, producto_id externo, graba_iva
│   │   └── pistaAuditoria.model.js     # JSONB, auditoría local
│   ├── graphql/
│   │   ├── typeDefs.js                 # Schema GraphQL propio
│   │   └── resolvers/
│   │       └── factura.resolver.js
│   ├── grpc/
│   │   ├── auditoria.proto             # ⚠️ PLACEHOLDER
│   │   └── auditoria.client.js         # Cliente gRPC → Seguridad
│   ├── services/
│   │   ├── factura.service.js          # Lógica de negocio (orquesta todo)
│   │   ├── inventario.service.js       # GraphQL → Inventario
│   │   ├── cxc.service.js              # REST → CXC
│   │   └── auditoria.service.js        # Escribe en pistas_auditoria local
│   └── app.js                          # Express + Apollo Server
├── herramientas/
│   ├── generarTokenPrueba.js           # Genera JWT local para testing
│   └── seedDatos.js                    # Inserta cliente de prueba en BD
├── server.js
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

---

## Instalación rápida

```bash
npm install
cp .env.example .env          # completar JWT_SECRET con el del equipo de Seguridad

# Solo levantar Postgres con Docker:
docker-compose up -d facturacion-db

# Correr en desarrollo:
npm run dev
```

---

## GraphQL: ejemplos de uso

### Crear factura
```graphql
mutation {
  crearFactura(input: {
    clienteId: "c1d2e3f4-aaaa-bbbb-cccc-dd1234567890",
    tipoPago: "Efectivo",
    detalles: [
      { productoId: "uuid-del-producto-en-inventario", cantidad: 3 }
    ]
  }) {
    id
    numeroFactura
    subtotal
    totalIva
    total
    estado
    cliente { nombre cedula }
    detalles {
      productoNombre
      cantidad
      precioUnitario
      grabaIva
      subtotalLinea
    }
  }
}
```

### Consultar facturas
```graphql
query {
  facturas(estado: "Emitida") {
    numeroFactura
    total
    tipoPago
    cliente { nombre }
  }
}
```

### Ver pistas de auditoría
```graphql
query {
  pistasAuditoria {
    accion
    fechaHora
    detalles
  }
}
```

---

## Cómo probar mientras los otros módulos no están listos

**1. JWT propio:**
```bash
node herramientas/generarTokenPrueba.js
```

**2. Cliente de prueba en la BD:**
```bash
node herramientas/seedDatos.js
```

**3. Simular Inventario (mientras el equipo no lo levanta):**
Levanta un servidor express mínimo en localhost:3001 que responda:
```json
{
  "data": {
    "producto": {
      "codigo": "uuid-que-mandes",
      "nombre": "Producto Prueba",
      "pvp": 25.00,
      "graba_iva": true,
      "estado": "activo",
      "stock_actual": 100
    }
  }
}
```
O pídeme y te armo ese mock en 5 minutos.

---

## ⚠️ Checklist de coordinación pendiente

### Con Inventario (Node + Postgres + GraphQL)
- [ ] Nombre exacto de la query (`producto(codigo: ID!)` ← propuesta)
- [ ] Campos exactos devueltos (confirmados según imagen: `codigo, nombre, graba_iva, pvp, estado, stock_actual`)
- [ ] Nombre de mutation para descontar stock
- [ ] Valor de `API_KEY_INVENTARIO` y `API_KEY_FACTURACION`
- [ ] Puerto local de Inventario para poner en `MODULO_INVENTARIO_GRAPHQL_URL`

### Con Seguridad (Django)
- [ ] `JWT_SECRET` exacto
- [ ] Campos del payload JWT (`id`, `nombre`, `rol` ← propuesta)
- [ ] `.proto` real del servicio gRPC de Auditoría
- [ ] `API_KEY_AUDITORIA`
- [ ] Puerto gRPC para `MODULO_SEGURIDAD_GRPC_URL`

### Con CXC (Nest + Next)
- [ ] Ruta y payload REST para registrar cuenta por cobrar
- [ ] Confirmar si CXC también llama a Facturación por GraphQL (ya expuesto)
- [ ] Puerto local de CXC para `MODULO_CXC_REST_URL`

### Con Clientes (Torres/Ramírez — misma BD)
- [ ] Confirmar que comparten la MISMA base de datos (BD compartida)
- [ ] Solicitar el SQL CREATE TABLE clientes para tenerlo en `docker-compose`
- [ ] Acordar quién corre las migraciones primero (Clientes debe correr antes de Facturación)
