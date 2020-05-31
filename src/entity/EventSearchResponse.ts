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

  @Field({nullable: true})
  addr1: string
  
  @Field({nullable: true})
  addr2: string

  @Field()
  briefDescription: string

  @Field({nullable: true})
  longDescription: string

  @Field({nullable: true})
  eventDate: Date

  @Field({nullable: true})
  userId: string

  @Field({nullable: true})
  displayName: string

  @Field({nullable: true})
  city: string

  @Field({nullable: true})
  state: string

  @Field({nullable: true})
  postal: string

  @Field({nullable: true})
  country: string

  @Field(type => LocationResponse, {nullable: true})
  location: LocationResponse
}