import {Entity, Column, PrimaryColumn, BaseEntity, OneToMany, CreateDateColumn, UpdateDateColumn} from "typeorm"
import { Field, ID, ObjectType } from 'type-graphql'
import { Registration } from './Registration'
import {Lazy} from './helpers'

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

  @OneToMany(type => Registration, attendee => attendee.attendee)
  eventsAttended: Lazy<Registration[]>

  @CreateDateColumn()
  @Field()
  created: Date

  @UpdateDateColumn()
  @Field()
  modified: Date
}
