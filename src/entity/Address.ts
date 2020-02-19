import { ObjectType, Field, ID } from 'type-graphql';
import { Lazy } from './helpers';
import { Event } from './Event';
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
} from 'typeorm';

@Entity("addresses")
@ObjectType()
export class Address extends BaseEntity {

  @PrimaryColumn({type: 'uuid'})
  @Field(type => ID)
  id: string

  @Column({nullable: false, length: 500, type: 'varchar'})
  @Field()
  addr1: string

  @Column({nullable: true, length: 500, type: 'varchar'})
  @Field()
  addr2: string

  @Column({nullable: false, length: 250, type: 'varchar'})
  @Field()
  city: string

  @Column({nullable: false, length: 250, type: 'varchar'})
  @Field()
  state: string

  @Column({nullable: false, length: 100, type: 'varchar'})
  @Field()
  postal: string

  @Column({nullable: false, length: 100, type: 'varchar'})
  @Field()
  country: string

  @Column({nullable: true, type: 'double precision'})
  @Field()
  lat: number

  @Column({nullable: true, type: 'double precision'})
  @Field()
  lng: number

  @OneToMany(type => Event, event => event.address, {lazy: true})
  @Field(type => [Address], {nullable: true})
  events?: Lazy<Event[]>

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