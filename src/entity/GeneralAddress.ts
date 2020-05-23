import { ObjectType, Field, ID } from 'type-graphql'
import { Lazy } from './helpers'
import { Group } from './Group'
import { User } from './User';
import { 
  BaseEntity, 
  Entity, 
  PrimaryColumn, 
  Column, 
  OneToMany, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('general_addresses')
@ObjectType()
export class GeneralAddress extends BaseEntity {

  @PrimaryColumn({type: 'uuid'})
  @Field(type => ID)
  id: string

  @Column({nullable: false, length: 50, type: 'varchar'})
  @Field()
  address: string
  
  @Column({nullable: true, type: 'double precision'})
  @Field()
  lat: number

  @Column({nullable: true, type: 'double precision'})
  @Field()
  lng: number

  @OneToMany(type => Group, group => group.generalAddress, {lazy: true, nullable: true})
  @Field(type => [Group], {nullable: true})
  groups?: Lazy<Group[]>

  @ManyToOne(type => User, user => user.id, {lazy: true})
  @JoinColumn({name: 'created_by'})
  @Field(type => User, {nullable: false})
  createdBy: Lazy<User>

  @CreateDateColumn()
  @Field()
  created: Date

  @UpdateDateColumn()
  @Field()
  modified: Date

}