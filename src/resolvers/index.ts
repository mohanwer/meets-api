import { UserResolver } from './user/UserResolver'
import { EventResolver } from './event/EventResolver';
import { RegistrationResolver } from './registration/RegistrationResolver'
import { BuildSchemaOptions } from 'type-graphql'
import { customAuthChecker } from './customAuthChecker'
import { Container } from 'typedi'
import { EventCommentResolver } from './comment/EventCommentResolver'
import { GroupResolver } from './group/GroupResolver';
import { GroupMemberResolver } from './groupMember/GroupMemberResolver';
import { ConfigResolver } from './configuration/ConfigResolver';
import { SearchResolver } from './search/SearchResolver'

const schemaOptions: BuildSchemaOptions = {
  resolvers: [
    EventResolver, 
    UserResolver, 
    RegistrationResolver, 
    EventCommentResolver,
    GroupMemberResolver,
    GroupResolver,
    ConfigResolver,
    SearchResolver
  ],
  authChecker: customAuthChecker,
  container: Container
}

export { 
  UserResolver, 
  EventResolver, 
  RegistrationResolver, 
  GroupResolver,
  GroupMemberResolver,
  EventCommentResolver,
  SearchResolver as EventSearchResolver, 
  schemaOptions 
}
