import {Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, ResolverInterface, Root} from 'type-graphql'
import { Event } from '../../entity/Event'
import { EventInput } from './event-input'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { v4 } from 'uuid'
import { User } from '../../entity/User'

@Resolver(of => Event)
export class EventResolver {
  constructor(
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) {}

  @Query(returns => Event, {nullable: true})
  async event(@Arg("id") id: string): Promise<Event | undefined> {
    return await this.eventRepo.findOne(id)
  }

  @Authorized()
  @Mutation(returns => Event)
  async addEvent(
    @Arg("eventData") eventData: EventInput,
    @Ctx("userId") userId: string
  ): Promise<Event> {
    const id = v4()
    const user = await this.userRepo.findOne(userId)
    const event = {
      id: id,
      ...eventData,
      createdBy: user
    }
    const newEvent = this.eventRepo.create(event)
    await this.eventRepo.save(newEvent)
    return await this.eventRepo.findOne(id)
  }
}
