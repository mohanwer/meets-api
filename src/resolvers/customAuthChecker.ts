import { AuthChecker } from 'type-graphql'
import {Context} from './Context'

export const customAuthChecker: AuthChecker<Context> = (
  {root, args, context, info}, roles
) => {
  return !!context.userId;
}
