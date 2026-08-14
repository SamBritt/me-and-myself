import { GraphQLScalarType, Kind } from 'graphql'
import type { Context } from './context.js'
import { authResolvers } from './resolvers/auth.js'
import { journalsResolvers } from './resolvers/journals.js'
import { journalResolvers } from './resolvers/journal.js'
import { moodResolvers } from './resolvers/mood.js'

const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO-8601 date-time string',
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value
  },
  parseValue(value) {
    return new Date(value as string)
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? new Date(ast.value) : null
  },
})

const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON value',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral(ast) {
    return parseLiteral(ast)
  },
})

function parseLiteral(ast: any): unknown {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value
    case Kind.INT:
    case Kind.FLOAT:
      return Number(ast.value)
    case Kind.OBJECT: {
      const value: Record<string, unknown> = {}
      for (const field of ast.fields) {
        value[field.name.value] = parseLiteral(field.value)
      }
      return value
    }
    case Kind.LIST:
      return ast.values.map(parseLiteral)
    case Kind.NULL:
      return null
    default:
      return null
  }
}

export const resolvers = {
  DateTime: DateTimeScalar,
  JSON: JSONScalar,
  Query: {
    health: () => true,
    ...authResolvers.Query,
    ...journalsResolvers.Query,
    ...journalResolvers.Query,
    ...moodResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...journalsResolvers.Mutation,
    ...journalResolvers.Mutation,
    ...moodResolvers.Mutation,
  },
  Journal: journalsResolvers.Journal,
}

export type { Context }
