import {Entity, Column, PrimaryColumn, BaseEntity, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany} from "typeorm"
import { Field, ID, ObjectType } from 'type-graphql'
import { Registration } from './Registration'
import { Lazy } from './helpers'
import { Event } from './Event';
import { Group } from './Group';
import { GroupMember } from './GroupMember';

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

  @OneToMany(type => Registration, registration => registration.attendee, {lazy: true, nullable: true})
  @Field(type => [Registration], {nullable: true})
  eventsAttended?: Lazy<Registration[]>

  @OneToMany(type => Event, event => event.createdBy, {lazy: true, nullable: true})
  @Field(type => [Event], {nullable: true})
  eventsCreated?: Lazy<Event[]>

  @OneToMany(type => Group, group => group.createdBy, {lazy: true, nullable: true})
  @Field(type => [Group], {nullable: true})
  groupsCreated?: Lazy<Group[]>

  @OneToMany(type => GroupMember, groupMember => groupMember.member, {lazy: true, nullable: true})
  @Field(type => [GroupMember], {nullable: true})
  groupMembership?: Lazy<GroupMember[]>

  @CreateDateColumn()
  @Field()
  created: Date

  @UpdateDateColumn()
  @Field()
  modified: Date
}