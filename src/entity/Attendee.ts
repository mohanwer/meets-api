import {
  Entity,
  PrimaryColumn,
  BaseEntity,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'
import { Field, ID, ObjectType } from 'type-graphql'
import { Lazy } from './helpers'
import { Event } from './Event'
import { User } from './User'

@Entity("attendees")
@ObjectType()
export class Attendee extends BaseEntity {

  @PrimaryColumn({type: 'uuid'})
  @Field(type => ID)
  id: string

  @ManyToOne(type => Event, {lazy: true, nullable: false})
  @Field(type => Event, {nullable: false})
  event: Lazy<Event>

  @ManyToOne(type => User, user => user.eventsAttended, {lazy: true})
  @Field(type => User, {nullable: false})
  attendee: Lazy<User>

  @CreateDateColumn()
  @Field(type => Date, {nullable: false})
  created: Date

  @UpdateDateColumn()
  @Field(type => Date, {nullable: false})
  modified: Date

}
