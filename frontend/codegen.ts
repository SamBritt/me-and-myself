import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../backend/src/graphql/schema.graphql',
  documents: ['src/**/*.ts', 'src/**/*.vue'],
  ignoreNoDocuments: true,
  generates: {
    'src/graphql/generated/': {
      preset: 'client',
      config: {
        useTypeImports: true,
        scalars: {
          DateTime: 'string',
          JSON: 'unknown',
        },
      },
    },
  },
}

export default config
