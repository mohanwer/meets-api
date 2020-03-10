import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { v4 } from 'uuid'
import { GroupMember } from '../../entity/GroupMember';
import { User } from '../../entity/User';
import { Group } from '../../entity/Group';

@Resolver(of => GroupMember)
export class GroupMemberResolver {
  constructor(
    @InjectRepository(GroupMember) private readonly groupMemberRepo: Repository<GroupMember>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>
  ) {}

  @Authorized()
  @Mutation(returns => GroupMember)
  async addGroupMember(
    @Arg('groupId') groupId: string,
    @Ctx('userId') userId: string
  ): Promise<GroupMember> {
    console.log(`Adding user ${userId} to group ${groupId}`)
    const id = v4()
    const user = await this.userRepo.findOne(userId)
    const group = await this.groupRepo.findOne(groupId)
    const groupMembers = await group.groupMembers

    if (!groupMembers.some(member => member.id === user.id))
      throw Error(`The user ${userId} is already a member of ${groupId}`)

    const groupMember = {
      id: id,
      group: group,
      member: user
    }
    const addedGroupMember = this.groupMemberRepo.create(groupMember)
    return await this.groupMemberRepo.save(addedGroupMember)
  }

  @Authorized()
  @Mutation(returns => Number)
  async deleteGroupMember(
    @Arg('groupMembershipId') groupMembershipId: string,
    @Ctx('userId') userId: string
  ): Promise<number | void> {
    const groupMembership = await this.groupMemberRepo.createQueryBuilder()
      .where('id = :id', { id: groupMembershipId})
      .andWhere('member = :userId', {userId: userId}).getOne()
    
      if (!groupMembership)
      throw Error(`There is no membership for ${groupMembershipId} with user ${userId}`)
    
    const deleteResult = await this.groupMemberRepo.delete(groupMembership)
    
    return deleteResult.affected
  }
}