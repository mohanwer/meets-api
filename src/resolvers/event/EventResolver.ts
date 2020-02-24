import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Event } from '../../entity/Event'
import { EventInput, EventUpdateInput } from './event-input';
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { v4 } from 'uuid'
import { User } from '../../entity/User'
import { Address } from '../../entity/Address'
import { geocode, AddressToGeoCode } from '../../services/geocode';
import { updateEventIndex } from '../../services/elastic';
import { UnauthorizedError } from 'express-jwt'
import * as isEqual from lodash.isEqual

@Resolver(of => Event)
export class EventResolver {
  constructor(
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Address) private readonly addressRepo: Repository<Address>
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
    const eventId = v4()
    const user = await this.userRepo.findOne(userId)
    const {address} = eventData
    const eventAddress = await this.getOrCreateAddress(address, user)
    const event = {
      id: eventId,
      ...eventData,
      address: eventAddress,
      createdBy: user
    }
    const newEvent = this.eventRepo.create(event)
    
    await this.eventRepo.save(newEvent)
    await updateEventIndex(newEvent)
    
    return await this.eventRepo.findOne(eventId)
  }

  @Authorized()
  @Mutation(returns => Event)
  async updateEvent(
    @Arg("eventData") eventData: EventUpdateInput,
    @Ctx("userId") userId: string
  ): Promise<Event> {
    const currentEvent = await this.eventRepo.findOne(eventData.id)
    const user = await currentEvent.createdBy

    if (user.id !== userId)
      throw new UnauthorizedError('credentials_required',{message: `Only user who created ${eventData.id} can modify it, not user ${userId}`})

    const currentAddress = await currentEvent.address
    const addressForCompare = (({addr1, addr2, city, state, postal, country}) => ({addr1, addr2, city, state, postal, country}))(currentAddress)

    const {address} = eventData
    const addressUpdateNeeded = isEqual(address, addressForCompare)
    const addressToSave = addressUpdateNeeded ? this.getOrCreateAddress(address, user) : currentAddress

    const eventForCompare = (({name, briefDescription, longDescription, eventDate}) => ({name, briefDescription, longDescription, eventDate}))(currentEvent)
    const eventFromInput = {
      name: eventData.name,
      briefDescription: eventData.briefDescription,
      longDescription: eventData.longDescription,
      eventDate: eventData.eventDate
    }
    
    const eventUpdateNeeded = isEqual(eventForCompare, eventFromInput)
    if (eventUpdateNeeded || addressUpdateNeeded) {
      const event = {
        ...eventData,
        address: addressToSave,
        createdBy: user
      }
      const updatedEvent = await this.eventRepo.save(event)
      await updateEventIndex(updatedEvent)
    }
    
    return await this.eventRepo.findOne(eventData.id)
  }

  async getOrCreateAddress(
    addressToCheck: AddressToGeoCode, 
    user: User
  ): Promise<Address> {
    const addressSearchResult = await this.addressRepo.find({
      where: {
        addr1: addressToCheck.addr1,
        city: addressToCheck.city,
        state: addressToCheck.state
      },
      take: 1
    })

    if (addressSearchResult.length === 1)
      return addressSearchResult[0]
    
    const addressId = v4()
    await geocode(addressToCheck)
    const address = {
      id: addressId,
      ...addressToCheck,
      createdBy: user
    }

    const newAddress = this.addressRepo.create(address)
    await this.addressRepo.save(newAddress)

    return await this.addressRepo.findOne(addressId)
  }
}
