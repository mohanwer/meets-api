import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { v4 } from 'uuid'
import { Group } from '../../entity/Group';
import { User } from '../../entity/User';
import { Event } from '../../entity/Event';
import { EventInput } from '../event/event-input';
import { EventResolver } from '../event/EventResolver';
import { AuthenticationError } from 'apollo-server-express';
import { GroupInput } from './GroupInput';
import { geocodeAddrStr } from '../../services/geocode';
import { GeneralAddress } from '../../entity/GeneralAddress';

@Resolver(of => GroupResolver)
export class GroupResolver {
  constructor(
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    @InjectRepository(GeneralAddress) private readonly generalAddressRepo: Repository<GeneralAddress>,
    private readonly eventResolver: EventResolver
  ) {}

  @Query(returns => Group, {nullable: true})
  async group(@Arg("id") id: string): Promise<Group | undefined> {
    return await this.groupRepo.findOne(id)
  }

  @Authorized()
  @Mutation(returns => Group)
  async addGroup(
    @Arg('groupInfo') groupInfo: GroupInput,
    @Ctx('userId') userId: string
  ): Promise<Group> {
    const id = v4()
    const {about, name} = groupInfo
    const user = await this.userRepo.findOne(userId)
    const address = await this.getOrCreateAddress(groupInfo.location, user)
    const newGroup = this.groupRepo.create({
      id: id,
      generalAddress: address,
      about: about,
      name: name,
      createdBy: user
    }).save()
    return newGroup
  }

  @Authorized()
  @Mutation(returns => Group)
  async addGroupEvent(
    @Arg('groupId') groupId: string,
    @Arg('eventData') eventData: EventInput,
    @Ctx('userId') userId: string
  ): Promise<Group> {
    const user = await this.userRepo.findOne(userId)
    const group = await this.groupRepo.findOne(groupId)
    const groupEvents = await group.events
    const groupUser = await group.createdBy

    if (groupUser.id !== user.id)
      throw new AuthenticationError(`User ${userId} does not have permission to update ${groupId}`)

    const event = await this.eventResolver.addEvent(eventData, userId)
    groupEvents.push(event)
    
    const groupUpdate = {
      ...group,
      events: group.events
    }
    
    await this.groupRepo.update(group.id, groupUpdate)
    return await this.groupRepo.findOne(group.id)
  }

  @Authorized()
  @Mutation(returns => Number)
  async deleteGroup(
    @Arg('groupId') groupId: string,
    @Ctx('userId') userId: string
  ): Promise<number | void> {
    const group = await this.groupRepo.findOne(groupId)
    const user = await group.createdBy
    
    if (user.id !== userId)
      throw new AuthenticationError(`User ${userId} does not have permission to delete this group ${groupId}`)
    
    const deleteResult = await this.groupRepo.delete(group.id)
    return deleteResult.affected
  }

  @Authorized()
  @Mutation(returns => Group)
  async updateGroup(
    @Arg('groupId') groupId: string,
    @Arg('groupInfo') groupInfo: GroupInput,
    @Ctx('userId') userId: string
  ): Promise<Group> {
    const groupInDb = await this.groupRepo.findOne(groupId)
    const addressInDb = await groupInDb.generalAddress
    const user = await groupInDb.createdBy

    if (user.id !== userId)
      throw new AuthenticationError(`User ${userId} does not have permission to delete this group ${groupId}`)

    if (groupInDb.about === groupInfo.about &&
        addressInDb.address === groupInfo.location &&
        groupInDb.name === groupInfo.name)
      return groupInDb

    const updatedAddress = await this.getOrCreateAddress(groupInfo.location, user)

    const updatedGroup = {
      about: groupInfo.about,
      name: groupInfo.name,
      generalAddress: updatedAddress
    }

    await this.groupRepo.update(groupInDb.id, updatedGroup)
    return await this.groupRepo.findOne(groupId)
  }

  async getOrCreateAddress(
    addressToCheck: string,
    user: User
  ): Promise<GeneralAddress> {
    const addressSearchResult = await this.generalAddressRepo.findOne({
      where: {
        location: addressToCheck
      }
    })

    if (addressToCheck) return addressSearchResult
    const {lat, lng} = await geocodeAddrStr(addressToCheck)
    const newAddress = await this.generalAddressRepo.create({
      id: v4(),
      address: addressToCheck,
      lat: lat,
      lng: lng,
      createdBy: user,
    }).save()
    return newAddress
  }
}