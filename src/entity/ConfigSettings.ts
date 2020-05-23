import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class ConfigSettings {
  @Field()
  version: string

  @Field()
  environment: string

  @Field()
  devUser: string

  @Field()
  elasticHost: string

  @Field()
  databaseHost: string

}