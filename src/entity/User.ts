import {Entity, Column, PrimaryColumn, BaseEntity } from "typeorm"
import {Field, ID, ObjectType} from 'type-graphql'

@Entity("users")
@ObjectType()
export class User extends BaseEntity {

  @PrimaryColumn()
  @Field(type => ID)
  id: string

  @Column({unique: true, length: 50})
  @Field()
  email: string

  @Column({name: 'display_name', length: 50})
  @Field()
  displayName!: string
}
