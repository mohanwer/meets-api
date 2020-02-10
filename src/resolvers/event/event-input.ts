import { InputType, Field, ID, Ctx } from 'type-graphql'

@InputType()
export class EventInput {
  @Field()
  name: string

  @Field()
  briefDescription: string

  @Field()
  longDescription: string
}
