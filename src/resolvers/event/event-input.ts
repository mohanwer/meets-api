import { InputType, Field } from 'type-graphql'

@InputType()
export class AddressInput {
  @Field()
  addr1: string

  @Field()
  addr2: string

  @Field()
  city: string

  @Field()
  state: string

  @Field()
  postal: string 

  @Field()
  country: string
}

@InputType()
export class EventInput {
  @Field()
  name: string

  @Field()
  briefDescription: string

  @Field()
  longDescription: string

  @Field()
  eventDate: Date

  @Field()
  address: AddressInput
}