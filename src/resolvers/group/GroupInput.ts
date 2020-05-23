import { InputType, Field } from 'type-graphql'

@InputType()
export class GroupInput {
  @Field()
  name: string

  @Field()
  location: string

  @Field()
  about: string
}