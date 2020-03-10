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
import { Group } from './Group';
import { User } from './User';

@Entity("group_members")
@ObjectType()
export class GroupMember extends BaseEntity {

  @PrimaryColumn({type: 'uuid'})
  @Field(type => ID)
  id: string

  @ManyToOne(type => Group, {lazy: true, nullable: false})
  @JoinColumn({name: 'group_id'})
  @Field(type => Group, {nullable: false})
  group: Lazy<Group>

  @ManyToOne(type => User, user => user.groupMembership, {lazy: true, nullable: false})
  @Field(type => User, {nullable: false})
  @JoinColumn({name: 'group_member_id'})
  member: Lazy<User>

  @CreateDateColumn()
  @Field(type => Date, {nullable: false})
  created: Date

  @UpdateDateColumn()
  @Field(type => Date, {nullable: false})
  modified: Date
}