import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import express from 'express'
import cors from 'cors'
import { createYoga, createSchema } from 'graphql-yoga'
import { resolvers } from './graphql/resolvers.js'
import { createContext, type Context } from './graphql/context.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const typeDefs = readFileSync(path.join(__dirname, 'graphql', 'schema.graphql'), 'utf-8')

const schema = createSchema<Context>({ typeDefs, resolvers })

const yoga = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: '/graphql',
})

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }))
app.use('/graphql', yoga)

const port = Number(process.env.PORT) || 4000
app.listen(port, () => {
  console.log(`Me&Myself backend listening on http://localhost:${port}/graphql`)
})
