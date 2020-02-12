import { UserResolver } from './user/UserResolver'
import { EventResolver } from './event/EventResolver'
import { AttendeeResolver } from './attendee/AttendeeResolver'
import { BuildSchemaOptions } from 'type-graphql'
import { customAuthChecker } from './customAuthChecker'
import { Container } from 'typedi'

const schemaOptions: BuildSchemaOptions = {
  resolvers: [EventResolver, UserResolver, AttendeeResolver],
  authChecker: customAuthChecker,
  container: Container
}

export { UserResolver, EventResolver, AttendeeResolver, schemaOptions }
