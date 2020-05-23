import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class SeedResult {
  @Field()
  tableName: string

  @Field()
  rowsSeeded: number
}