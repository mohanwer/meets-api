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

@Resolver(of => GroupResolver)
export class GroupResolver {
  constructor(
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    private readonly eventResolver: EventResolver
  ) {}

  @Query(returns => Group, {nullable: true})
  async group(@Arg("id") id: string): Promise<Group | undefined> {
    return await this.groupRepo.findOne(id)
  }

  @Authorized()
  @Mutation(returns => Group)
  async addGroup(
    @Arg('about') about: string,
    @Ctx('userId') userId: string
  ): Promise<Group> {
    const id = v4()
    const user = await this.userRepo.findOne(userId)
    const group = {
      id: id,
      about: about,
      createdBy: user
    }
    const updatedGroup = this.groupRepo.create(group)
    return await this.groupRepo.save(updatedGroup)
  }

  @Authorized()
  @Mutation(returns => Group)
  async addEvent(
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
}