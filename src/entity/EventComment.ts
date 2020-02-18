import {
  Entity,
  Column,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn, ManyToOne
} from "typeorm"
import { Field, ID, ObjectType } from 'type-graphql'
import { User } from './User'
import { Event } from './Event'
import {Lazy} from './helpers'


@Entity("event_comments")
@ObjectType()
export class EventComment extends BaseEntity {
  @PrimaryColumn({type: 'uuid'})
  @Field(type => ID)
  id: string

  @Column({name: 'comment_text', type: 'varchar', nullable: false, length: 4000})
  @Field()
  commentText: string

  @ManyToOne(type => Event, {lazy: true, nullable: false})
  @Field(type => Event, {nullable: false})
  event: Lazy<Event>

  @ManyToOne(type => User, user => user.id, {lazy: true})
  @JoinColumn({name: 'created_by'})
  @Field(type => User, {nullable: false})
  createdBy: Lazy<User>

  @CreateDateColumn()
  @Field(type => Date, {nullable: false})
  created: Date

  @UpdateDateColumn()
  @Field(type => Date, {nullable: false})
  modified: Date
}
