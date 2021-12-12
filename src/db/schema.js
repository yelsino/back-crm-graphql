import { gql } from 'apollo-server';

const typeDefs = gql`
  
  # AUTH
  type Usuario {
    id: ID
    nombre: String
    apellido: String
    email: String
  }

  type Token {
    token: String
  }

  input UsuarioInput {
    nombre: String!
    apellido: String!
    email: String!
    password: String!
  }

  input AutenticarInput {
    email: String!
    password: String!
  }


  # PRODUCTOS
  input ProductoInput {
    nombre: String!
    existencia: Int!
    precio: Float!
  }

  type Producto {
    id: ID
    nombre: String
    existencia: Int
    precio: Float
  }

  # CLIENTES
  input ClienteInput {
    nombre: String!
    apellido: String!
    empresa: String!
    email: String!
    telefono: String
  }
  type Cliente {
    id: ID
    nombre: String
    apellido: String
    empresa: String
    email: String
    telefono: String
    vendedor: ID
  }

  # PEDIDOS
  input PedidoProductoInput {
    id: ID
    cantidad: Int
  }
  input PedidoInput {
    pedido: [PedidoProductoInput]
    total: Float
    cliente: ID
    estado: EstadoPedido
  }
  enum EstadoPedido {
    PENDIENTE
    COMPLETADO
    CANCELADO
  }

  type Pedido {
    id: ID
    pedido: [PedidoGrupo]
    total: Float
    cliente: ID
    vendedor: ID
    estado: EstadoPedido
  }

  type PedidoGrupo {
    id: ID
    cantidad: Int
  }

  type TopCliente {
    total: Float
    cliente: [Cliente]
  }
  type TopVendedor {
    total: Float
    vendedor: [Usuario]
  }
  


  type Query {
    # AUTH
    obtenerUsuario: Usuario
    # PRODUCTOS
    obtenerProductos: [Producto]
    obtenerProducto(id: ID!): Producto
    buscarProducto(texto: String!): [Producto]
    # CLIENTES
    obtenerClientes: [Cliente]
    obtenerClientesVendedor: [Cliente]
    obtenerCliente(id: ID!): Cliente
    # PEDIDOS
    obtenerPedidos: [Pedido]
    obtenerPedidosVendedor: [Pedido]
    obtenerPedido(id: ID!): Pedido,
    obtenerPedidosEstado(estado: String!): [Pedido]
    mejoresClientes: [TopCliente]
    mejoresVendedores: [TopVendedor]
  }

  type Mutation {
    # AUTH
    nuevoUsuario(input: UsuarioInput) : Usuario
    autenticarUsuario(input: AutenticarInput): Token
    # PRODUCTOS
    nuevoProducto(input: ProductoInput): Producto
    actualizarProducto(id: ID!, input: ProductoInput): Producto
    eliminarProducto(id: ID!): String
    # CLIENTES
    nuevoCliente(input: ClienteInput): Cliente
    actualizarCliente(id: ID!, input: ClienteInput): Cliente
    eliminarCliente(id: ID!): String
    # PEDIDOS
    nuevoPedido(input: PedidoInput): Pedido
    actualizarPedido(id: ID!, input: PedidoInput): Pedido
    eliminarPedido(id: ID!): String
    
    
  }

`;


export default typeDefs;