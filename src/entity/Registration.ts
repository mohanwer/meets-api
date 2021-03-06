import {
  Entity,
  PrimaryColumn,
  BaseEntity,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm'
import { Field, ID, ObjectType } from 'type-graphql'
import { Lazy } from './index';
import { Event } from './Event';
import { User } from './User';

@Entity("event_attendees")
@ObjectType()
export class Registration extends BaseEntity {

  @PrimaryColumn({type: 'uuid'})
  @Field(type => ID)
  id: string

  @ManyToOne(type => Event, {lazy: true, nullable: false})
  @JoinColumn({name: 'event_id'})
  @Field(type => Event, {nullable: false})
  event: Lazy<Event>

  @ManyToOne(type => User, user => user.eventsAttended, {lazy: true, nullable: false})
  @JoinColumn({name: 'attendee_id'})
  @Field(type => User, {nullable: false})
  attendee: Lazy<User>

  @CreateDateColumn()
  @Field(type => Date, {nullable: false})
  created: Date

  @UpdateDateColumn()
  @Field(type => Date, {nullable: false})
  modified: Date
}
