import {
  Entity,
  Column,
  PrimaryColumn,
  JoinColumn,
  BaseEntity,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne
} from "typeorm"
import { Field, ID, ObjectType } from 'type-graphql'
import { User } from './User'
import { Registration } from './Registration'
import { EventComment } from './EventComment'
import { Lazy } from './helpers'
import { Address } from "./Address"
import { Group } from "./Group"

@Entity("events")
@ObjectType()
export class Event extends BaseEntity {

  @PrimaryColumn({type: 'uuid'})
  @Field(type => ID)
  id: string

  @Column({nullable: false, length: 250, type: 'varchar'})
  @Field()
  name: string

  @Column({name: "brief_description", length: 1000, type: 'varchar'})
  @Field()
  briefDescription?: string

  @Column({name: 'long_description', length: 4000, type: 'varchar'})
  @Field()
  longDescription?: string

  @Column({name: 'event_date', nullable: false})
  @Field(returns => Date, {nullable: false})
  eventDate: Date

  @ManyToOne(type => User, user => user.id, {lazy: true})
  @JoinColumn({name: 'created_by'})
  @Field(type => User, {nullable: false})
  createdBy: Lazy<User>

  @OneToMany(type => Registration, registration => registration.event, {lazy: true, onDelete: "CASCADE"})
  @Field(type => [Registration], {nullable: true})
  attendees?: Lazy<Registration[]>

  @OneToMany<EventComment>(type => EventComment, eventComment => eventComment.event, {lazy: true, onDelete: "CASCADE"})
  @Field(type => [EventComment], {nullable: true})
  comments?: Lazy<EventComment[]>

  @ManyToOne<Group>(type => Group, group => group.events, {lazy: true, nullable: true})
  @JoinColumn({name: 'created_by_group'})
  @Field(type => Group)
  createdByGroup?: Lazy<Group>

  @ManyToOne(type => Address, address => address.events, {lazy: true})
  @JoinColumn({name: 'address_id'})
  @Field(type => Address)
  address?: Lazy<Address>

  @CreateDateColumn()
  @Field()
  created: Date

  @UpdateDateColumn()
  @Field()
  modified: Date
}
