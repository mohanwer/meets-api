import {
  Entity,
  Column,
  PrimaryColumn,
  JoinColumn,
  BaseEntity,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { Field, ID, ObjectType } from 'type-graphql'
import { User } from './User';
import { Event } from './Event';
import { Lazy } from './helpers';
import { GroupMember } from './GroupMember';

@Entity("groups")
@ObjectType()
export class Group extends BaseEntity {

  @PrimaryColumn({type: 'uuid'})
  @Field(type => ID)
  id: string

  @Column({nullable: false, length: 8000, type: 'varchar'})
  @Field()
  about: string

  @OneToMany<Event>(type => Event, event => event.createdByGroup, {lazy: true, nullable: true, onDelete: "CASCADE"})
  @Field(type => [Event], {nullable: true})
  events?: Lazy<Event[]>

  @ManyToOne(type => User, user => user.id, {lazy: true})
  @JoinColumn({name: 'created_by'})
  @Field(type => User, {nullable: false})
  createdBy: Lazy<User>

  @OneToMany(type => GroupMember, groupMember => groupMember.group, {lazy: true, nullable: true, onDelete: "CASCADE"})
  @Field(type => [GroupMember], {nullable: true})
  groupMembers?: Lazy<GroupMember[]>

  @CreateDateColumn()
  @Field()
  created: Date

  @UpdateDateColumn()
  @Field()
  modified: Date
}