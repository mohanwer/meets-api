import { ObjectType, Field } from 'type-graphql'

@ObjectType()
export class LocationResponse {
  @Field()
  lat: number
  
  @Field()
  lon: number
}

@ObjectType()
export class EventSearchResponse {
  @Field()
  id: string

  @Field()
  name: string

  @Field()
  addr1: string
  
  @Field({nullable: true})
  addr2: string

  @Field()
  briefDescription: string

  @Field()
  longDescription: string

  @Field()
  eventDate: Date

  @Field()
  userId: string

  @Field()
  displayName: string

  @Field()
  city: string

  @Field()
  state: string

  @Field({nullable: true})
  postal: string

  @Field()
  country: string

  @Field(type => LocationResponse, {nullable: true})
  location: LocationResponse
}