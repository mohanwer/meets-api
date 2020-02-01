import { InputType, Field, ID, Ctx } from 'type-graphql'

@InputType()
export class EventInput {
  @Field(type => ID)
  id: string

  @Field()
  name: string

  @Field()
  briefDescription: string

  @Field()
  longDescription: string
}
