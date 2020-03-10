import {Arg, Authorized, Ctx, Mutation, Query, Resolver} from 'type-graphql'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { v4 } from 'uuid'
import { Event } from '../../entity/Event'
import { Registration } from '../../entity/Registration'
import { User } from '../../entity/User'
import {UnauthorizedError} from 'express-jwt'

@Resolver(of => Registration)
export class RegistrationResolver {
  constructor(
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Registration) private readonly attendeeRepo: Repository<Registration>
  ) {}

  @Query(returns => Registration, { nullable: true })
  async attendee(@Arg("id") id: string): Promise<Registration | undefined> {
    return await this.attendeeRepo.findOne(id)
  }

  @Authorized()
  @Mutation(returns => Registration)
  async addAttendee(
    @Arg("eventId") eventId: string,
    @Ctx("userId") userId: string
  ): Promise<Registration> {
    console.log(`Registering user ${userId} for event ${eventId}`)
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

  @Authorized()
  @Mutation(returns => Number)
  async deleteAttendee(
    @Arg("registrationId") registrationId: string,
    @Ctx("userId") userId: string
  ): Promise<number | void> {
    console.log(`Deleting user ${userId} from registration registration ${registrationId}`)
    const attendeeRegistration = await this.attendeeRepo.findOne(registrationId)
    const attendee: User =  await attendeeRegistration.attendee
    if (attendee.id !== userId){
      const message = `Only the user who registration for ${registrationId} can remove themselves from the event, not user ${userId}`
      console.log(message)
      throw new UnauthorizedError('credentials_required', {message: message})
    }

    const deleteResult = await this.attendeeRepo.delete(attendeeRegistration.id)
    return deleteResult.affected
  }
}
