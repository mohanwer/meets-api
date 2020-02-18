import { UserResolver } from './user/UserResolver'
import { EventResolver } from './event/EventResolver'
import { RegistrationResolver } from './registration/RegistrationResolver'
import { BuildSchemaOptions } from 'type-graphql'
import { customAuthChecker } from './customAuthChecker'
import { Container } from 'typedi'
import { EventCommentResolver } from './comment/EventCommentResolver'

const schemaOptions: BuildSchemaOptions = {
  resolvers: [EventResolver, UserResolver, RegistrationResolver, EventCommentResolver],
  authChecker: customAuthChecker,
  container: Container
}

export { UserResolver, EventResolver, RegistrationResolver, EventCommentResolver, schemaOptions }
