import { InputType, Field } from 'type-graphql'

@InputType()
export class AttendeeInput {
  @Field()
  eventId: string
}
