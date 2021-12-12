// import express from "express";
import { ApolloServer, gql } from "apollo-server";
import connectarDatabase from "./config/database";
import dotenv from 'dotenv';
import typeDefs from "./db/schema";
import resolvers from "./db/resolvers";
import { makeExecutableSchema } from "apollo-server-core/node_modules/graphql-tools";
import jwt from 'jsonwebtoken';

dotenv.config({ path: 'dotenv.env' });
connectarDatabase()


const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    const token = req.headers['authorization'] || '';
    if (token) {
      try {
        const usuario = jwt.verify(token, process.env.TOKEN_SECRETO);
        console.log(usuario);
        return {
          usuario
        }
      } catch (error) {
        console.log('hubo un error');
        console.log(error);
      }
    }
    console.log()
  },
  introspection: true,
});

server.listen().then(({ url }) => {
  console.log(`server ready at ${url}`);
})
