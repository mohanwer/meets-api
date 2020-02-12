import { schemaOptions } from '../resolvers'
import { Maybe, buildSchema } from 'type-graphql'
import { graphql, GraphQLSchema } from 'graphql'

interface Options {
  source: string
  variableValues?: Maybe< {[key: string]: any}>
  userId: string
}

let schema: GraphQLSchema;

export const gCall = async ({source, variableValues, userId}: Options) => {
  schema = await buildSchema(schemaOptions)
  return graphql({
    schema,
    source,
    variableValues,
    contextValue: {
      userId: 'testUser'
    }
  })
}
