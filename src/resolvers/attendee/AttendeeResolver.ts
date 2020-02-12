import {Arg, Authorized, Ctx, Mutation, Query, Resolver} from 'type-graphql'
import { Attendee } from '../../entity/Attendee'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { v4 } from 'uuid'
import { User } from '../../entity/User'
import { Event } from '../../entity/Event'

@Resolver(of => Attendee)
export class AttendeeResolver {
  constructor(
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Attendee) private readonly attendeeRepo: Repository<Attendee>
  ) {}

  @Query(returns => Attendee, { nullable: true })
  async attendee(@Arg("id") id: string): Promise<Attendee | undefined> {
    return await this.attendeeRepo.findOne(id)
  }

  @Authorized()
  @Mutation(returns => Attendee)
  async addAttendee(
    @Arg("eventId") eventId: string,
    @Ctx("userId") userId: string
  ): Promise<Attendee> {
    const id = v4()
    const user = await this.userRepo.findOne(userId)

    const event = await this.eventRepo.findOne(eventId)
    if (event.eventDate < new Date())
      throw new Error('Cannot register for expired event')

    const attendee = {
      id: id,
      event: event,
      attendee: user
    }
    const registeredAttendee = this.attendeeRepo.create(attendee)
    await this.attendeeRepo.save(registeredAttendee)
    return await this.attendeeRepo.findOne(id)
  }
}
