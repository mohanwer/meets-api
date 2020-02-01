import { Request } from 'request'

export interface Context {
  req: Request,
  userId: string
}
