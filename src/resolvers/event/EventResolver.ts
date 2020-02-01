import {Arg, Authorized, Ctx, Mutation, Query, Resolver} from 'type-graphql'
import { Event } from '../../entity/Event'
import { EventInput } from './event-input'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { uuid } from 'uuid'
import {User} from '../../entity/User'

@Resolver()
export class EventResolver {
  constructor(
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) {}

  @Query(returns => Event, {nullable: true})
  async getEvent(@Arg("id") id: string): Promise<Event | undefined> {
    return await this.eventRepo.findOne(id)
  }

  @Authorized()
  @Mutation(returns => Event)
  async addEvent(
    @Arg("EventInput") eventData: EventInput,
    @Ctx("userId") userId: string
  ): Promise<Event> {
    const id = uuid.uuid4()
    const user = await this.userRepo.findOne(id)
    const event = {
      id: id,
      ...eventData,
      createdBy: user
    }
    await this.eventRepo.insert(event)
    return await this.eventRepo.findOne(id)
  }
}
