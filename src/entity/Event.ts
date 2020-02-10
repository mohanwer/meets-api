import {Entity, Column, PrimaryColumn, OneToOne, JoinColumn, BaseEntity} from "typeorm"
import {Field, ID, ObjectType} from 'type-graphql'
import {User} from './User'
import { Lazy } from './helpers'

@Entity("events")
@ObjectType()
export class Event extends BaseEntity{

  @PrimaryColumn({type: 'uuid'})
  @Field(type => ID)
  id: string

  @Column({nullable: false, length: 100})
  @Field()
  name: string

  @Column({name: "brief_description", length: 500})
  @Field()
  briefDescription?: string

  @Column({name: 'long_description', length: 4000})
  @Field()
  longDescription?: string

  @OneToOne(type => User, user => user.id, {lazy: true})
  @JoinColumn({name: 'created_by'})
  @Field(type => User, {nullable: false})
  createdBy: Lazy<User>
}
