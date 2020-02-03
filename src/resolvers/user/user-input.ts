import { InputType, Field, ID} from 'type-graphql'

@InputType()
export class UserInput {
  @Field(type => ID)
  id: string

  @Field()
  email: string

  @Field()
  displayName: string
}
