import { InputType, Field } from 'type-graphql'

@InputType()
class LocationRequest {
  @Field({nullable: true})
  lat?: number
  
  @Field({nullable: true})
  lng?: number
  
  @Field({nullable: true})
  distance?: string
}

@InputType()
export class EventSearchRequest {
  @Field({nullable: true})
  eventName?: string
  
  @Field({nullable: true})
  postal?: string
  
  @Field(type => LocationRequest, {nullable: true})
  location?: LocationRequest
  
  @Field({nullable: true})
  from?: number
  
  @Field({nullable: true})
  size?: number
}