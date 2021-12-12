// @ts-nocheck
import Usuario from '../models/usuario';
import Producto from '../models/Producto';
import Cliente from '../models/Cliente';
import Pedido from '../models/Pedidos';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const crearToken = (usuario, secreta, expiresIn) => {
  const { id, email, nombre, apellido } = usuario;
  return jwt.sign({ id, email, nombre, apellido }, secreta, { expiresIn });
}

const resolvers = {
  Query: {
    // auth
    obtenerUsuario: async (_, { }, ctx) => {
      // const usuarioId = await jwt.verify(token, process.env.TOKEN_SECRETO);
      // return usuarioId;
      return ctx.usuario;
    },
    // PRODUCTOS
    obtenerProductos: async () => {
      try {
        const productos = await Producto.find({});
        return productos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerProducto: async (_, { id }) => {
      try {
        const producto = await Producto.findById(id);
        if (!producto) {
          throw new Error('Producto no encontrado');
        }
        return producto;
      } catch (error) {
        console.log(error);
      }
    },
    buscarProducto: async (_, { texto }) => {
      const productos = await Producto.find({ $text: { $search: texto } }).limit(10);
      return productos;
    },

    // CLIENTES
    obtenerClientes: async () => {
      try {
        const clientes = await Cliente.find({});
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerClientesVendedor: async (_, { }, ctx) => {
      try {
        const clientes = await Cliente.find({ vendedor: ctx.usuario.id.toString() });
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerCliente: async (_, { id }, ctx) => {
      try {
        const cliente = await Cliente.findById(id);
        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }
        if (cliente.vendedor.toString() !== ctx.usuario.id) {
          throw new Error('No tienes permisos');
        }
        return cliente;
      } catch (error) {
        console.log(error);
      }
    },
    // PEDIDOS
    obtenerPedidos: async () => {
      try {
        const pedidos = await Pedido.find({});
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidosVendedor: async (_, { }, ctx) => {
      try {
        const pedidos = await Pedido.find({ vendedor: ctx.usuario.id.toString() });
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedido: async (_, { id }, ctx) => {
      try {
        const pedido = await Pedido.findById(id);
        if (!pedido) {
          throw new Error('Pedido no encontrado');
        }
        if (pedido.vendedor.toString() !== ctx.usuario.id) {
          throw new Error('No tienes permisos');
        }
        return pedido;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidosEstado: async (_, { estado }, ctx) => {
      const pedidos = await Pedido.find({ vendedor: ctx.usuario.id.toString(), estado });
      return pedidos;
    },
    mejoresClientes: async () => {
      const clientes = await Pedido.aggregate([
        { $match: { estado: 'COMPLETADO' } },
        { $group: { _id: '$cliente', total: { $sum: '$total' } } },
        { $lookup: { from: 'clientes', localField: '_id', foreignField: '_id', as: 'cliente' } },
        { $limit: 10 },
        { $sort: { total: -1 } }
      ]);
      return clientes;
    },
    mejoresVendedores: async () => {
      const vendedores = await Pedido.aggregate([
        { $match: { estado: "COMPLEADO" } },
        { $group: { _id: '$vendedor', total: { $sum: '$total' } } },
        { $lookup: { from: 'usuarios', localField: '_id', foreignField: '_id', as: 'vendedor' } },
        { $limit: 5 },
        { $sort: { total: -1 } }
      ]);
      return vendedores;
    }
  },
  Mutation: {
    nuevoUsuario: async (_, { input }) => {
      const { email, password } = input;
      // revisar si el usuario existe
      const existeUsuario = await Usuario.findOne({ email });
      if (existeUsuario) {
        throw new Error('El usuario ya existe');
      }
      console.log('no avance');

      // hashear el password
      const salt = await bcrypt.genSalt(10);
      input.password = await bcrypt.hash(password, salt);

      try {
        const usuario = new Usuario(input);
        await usuario.save();
        return usuario
      } catch (error) {
        console.log(error);
      }
      // const usuario = new Usuario({ email, password });

    },

    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;
      // revisar si el usuario existe
      const existeUsuario = await Usuario.findOne({ email });
      if (!existeUsuario) {
        throw new Error('El usuario no existe');
      }
      // revisar el password
      const passwordCorrecto = await bcrypt.compare(password, existeUsuario.password);
      if (!passwordCorrecto) {
        throw new Error('El password es incorrecto');
      }
      // generar el token
      return {
        token: crearToken(existeUsuario, process.env.TOKEN_SECRETO, '24h')
      }
    },

    // PRODUCTOS
    nuevoProducto: async (_, { input }) => {
      try {
        const producto = new Producto(input);
        await producto.save();
        return producto;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarProducto: async (_, { id, input }) => {
      try {
        let producto = await Producto.findById(id);
        if (!producto) {
          throw new Error('Producto no encontrado');
        }
        const newproduct = await Producto.findOneAndUpdate({ _id: id }, input, { new: true });
        return newproduct;
      } catch (error) {
        console.log(error);
      }
    },
    eliminarProducto: async (_, { id }) => {
      try {
        let producto = await Producto.findById(id);
        if (!producto) {
          throw new Error('Producto no encontrado');
        }
        await Producto.findOneAndDelete({ _id: id });
        return 'Producto eliminado';
      } catch (error) {
        console.log(error);
      }
    },
    // CLIENTES
    nuevoCliente: async (_, { input }, ctx) => {
      const { email } = input;
      const cliente = await Cliente.findOne({ email });
      if (cliente) {
        throw new Error('El cliente ya existe');
      }
      try {
        const newclient = new Cliente(input);
        newclient.vendedor = ctx.usuario.id;
        await newclient.save();
        return newclient;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarCliente: async (_, { id, input }, ctx) => {
      try {
        let cliente = await Cliente.findById(id);
        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }
        if (cliente.vendedor.toString() !== ctx.usuario.id) {
          throw new Error('No tienes permisos');
        }
        const newclient = await Cliente.findOneAndUpdate({ _id: id }, input, { new: true });
        return newclient;
      } catch (error) {
        console.log(error);
      }
    },
    eliminarCliente: async (_, { id }, ctx) => {
      try {
        let cliente = await Cliente.findById(id);
        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }
        if (cliente.vendedor.toString() !== ctx.usuario.id) {
          throw new Error('No tienes permisos');
        }
        await Cliente.findOneAndDelete({ _id: id });
        return 'Cliente eliminado';
      } catch (error) {
        console.log(error);
      }
    },
    // PEDIDOS
    nuevoPedido: async (_, { input }, ctx) => {
      try {
        const { cliente } = input;
        const clienteExiste = await Cliente.findById(cliente);
        if (!clienteExiste) {
          throw new Error('Cliente no encontrado');
        }
        if (clienteExiste.vendedor.toString() !== ctx.usuario.id) {
          throw new Error('No tienes permisos');
        }
        // revisar si el stock este disponible
        for await (const articulo of input.pedido) {
          const { id } = articulo;
          const producto = await Producto.findById(id);

          if (articulo.cantidad > producto.existencia) {
            throw new Error('No hay stock suficiente');
          } else {
            producto.existencia = producto.existencia - articulo.cantidad;
            await producto.save();
          }
        }

        const pedido = new Pedido(input);
        pedido.vendedor = ctx.usuario.id;
        await pedido.save();
        return pedido;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarPedido: async (_, { id, input }, ctx) => {
      try {
        let pedido = await Pedido.findById(id);
        if (!pedido) {
          throw new Error('Pedido no encontrado');
        }
        if (pedido.vendedor.toString() !== ctx.usuario.id) {
          throw new Error('No tienes permisos');
        }
        // revisar si el stock este disponible
        if (input.pedido) {
          for await (const articulo of input.pedido) {
            const { id } = articulo;
            const producto = await Producto.findById(id);

            if (articulo.cantidad > producto.existencia) {
              throw new Error('No hay stock suficiente');
            } else {
              producto.existencia = producto.existencia - articulo.cantidad;
              await producto.save();
            }
          }
        }

        const newpedido = await Pedido.findOneAndUpdate({ _id: id }, input, { new: true });
        return newpedido;
      } catch (error) {
        console.log(error);
      }
    },
    eliminarPedido: async (_, { id }, ctx) => {
      const pedido = await Pedido.findById(id);
      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }
      if (pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No tienes permisos');
      }

      await Pedido.findOneAndDelete({ _id: id });

      return 'Pedido eliminado'
    }
  }
}


export default resolvers;