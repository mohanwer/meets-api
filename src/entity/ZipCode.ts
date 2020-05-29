import {
  Entity,
  Column,
  PrimaryColumn,
  BaseEntity,
} from "typeorm"
import { ID, Field, ObjectType } from 'type-graphql'

@Entity("zip_codes")
@ObjectType()
export class ZipCode extends BaseEntity {
  @PrimaryColumn({length: 100, type: 'varchar'})
  @Field(type => ID)
  postal: string

  @Column({nullable: false, type: 'double precision'})
  @Field()
  lat: number

  @Column({nullable: false, type: 'double precision'})
  @Field()
  lon: number
}