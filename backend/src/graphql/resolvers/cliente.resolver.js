// src/graphql/resolvers/cliente.resolver.js
//
// Resolvers GraphQL para la administración de clientes (HU1 y HU2).
//
// Mutations: crearCliente, actualizarCliente
// Queries:   clientes, buscarClientes, cliente

const clienteService = require('../../services/cliente.service');

function requiereAuth(context) {
  if (!context.usuario) {
    const e = new Error('No autorizado: se requiere JWT válido');
    e.extensions = { code: 'UNAUTHENTICATED' };
    throw e;
  }
}

function mapearCliente(c) {
  const data = c.toJSON ? c.toJSON() : c;
  return {
    id:              data.id,
    cedula:          data.cedula,
    nombre:          data.nombre,
    fechaNacimiento: data.fecha_nacimiento,
    tipoCliente:     data.tipo_cliente,
    direccion:       data.direccion,
    telefono:        data.telefono,
    email:           data.email,
    estado:          data.estado
  };
}

const resolvers = {
  Query: {
    // Lista todos los clientes (filtro opcional por estado)
    clientes: async (_, { estado }, ctx) => {
      requiereAuth(ctx);
      const lista = await clienteService.listarClientes(estado);
      return lista.map(mapearCliente);
    },

    // Obtiene un cliente por UUID
    cliente: async (_, { id }, ctx) => {
      requiereAuth(ctx);
      const c = await clienteService.obtenerClientePorId(id);
      return mapearCliente(c);
    },

    // HU2 CA1: búsqueda por cédula o nombre para la cabecera de factura
    // Retorna lista vacía si no hay coincidencias (el frontend muestra el mensaje)
    buscarClientes: async (_, { termino }, ctx) => {
      requiereAuth(ctx);
      try {
        const lista = await clienteService.buscarClientes(termino);
        return {
          resultados: lista.map(mapearCliente),
          mensaje: lista.length === 0 ? 'No se encontraron resultados' : null
        };
      } catch (err) {
        throw new Error(err.message);
      }
    }
  },

  Mutation: {
    // HU1 CA4: crear cliente — guarda y retorna mensaje de éxito
    crearCliente: async (_, { input }, ctx) => {
      requiereAuth(ctx);
      try {
        const cliente = await clienteService.crearCliente(input, ctx.usuario);
        return {
          cliente: mapearCliente(cliente),
          mensaje: 'Registro guardado con éxito'
        };
      } catch (err) {
        // CA1 y CA2: re-lanzar con mensaje claro para el frontend
        throw new Error(err.message);
      }
    },

    // HU1 CA3: actualizar/inactivar cliente (nunca elimina)
    actualizarCliente: async (_, { id, input }, ctx) => {
      requiereAuth(ctx);
      try {
        const cliente = await clienteService.actualizarCliente(id, input, ctx.usuario);
        return {
          cliente: mapearCliente(cliente),
          mensaje: 'Registro guardado con éxito'
        };
      } catch (err) {
        throw new Error(err.message);
      }
    }
  }
};

module.exports = resolvers;
