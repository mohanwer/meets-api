import {
  Entity,
  Column,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  BaseEntity,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm"
import { Field, ID, ObjectType } from 'type-graphql'
import { User, Registration, EventComment } from '.'
import { Lazy } from './helpers'

@Entity("events")
@ObjectType()
export class Event extends BaseEntity {

  @PrimaryColumn({type: 'uuid'})
  @Field(type => ID)
  id: string

  @Column({nullable: false, length: 100, type: 'varchar'})
  @Field()
  name: string

  @Column({name: "brief_description", length: 500, type: 'varchar'})
  @Field()
  briefDescription?: string

  @Column({name: 'long_description', length: 4000, type: 'varchar'})
  @Field()
  longDescription?: string

  @Column({name: 'event_date', nullable: false})
  @Field(returns => Date, {nullable: false})
  eventDate: Date

  @OneToOne(type => User, user => user.id, {lazy: true})
  @JoinColumn({name: 'created_by'})
  @Field(type => User, {nullable: false})
  createdBy: Lazy<User>

  @OneToMany(type => Registration, attendee => attendee.event, {lazy: true})
  @Field(type => [Registration], {nullable: true})
  attendees?: Lazy<Registration[]>

  @OneToMany<EventComment>(type => Comment, comment => comment.event, {lazy: true})
  @Field(type => [EventComment], {nullable: true})
  comments?: Lazy<EventComment[]>

  @CreateDateColumn()
  @Field()
  created: Date

  @UpdateDateColumn()
  @Field()
  modified: Date
}
