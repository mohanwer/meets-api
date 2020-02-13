import {Arg, Authorized, Ctx, Mutation, Query, Resolver} from 'type-graphql'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { v4 } from 'uuid'
import { EventComment, User, Event } from '../../entity'
import {UnauthorizedError} from 'express-jwt'

@Resolver(of => EventComment)
export class EventCommentResolver {
  constructor(
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(EventComment) private readonly commentRepo: Repository<EventComment>
  ) {}

  @Query(returns => EventComment, {nullable: true})
  async eventComment(@Arg("id") id: string): Promise<EventComment | undefined> {
    return await this.commentRepo.findOne(id)
  }

  @Authorized()
  @Mutation(returns => EventComment)
  async addEventComment(
    @Arg("eventId") eventId: string,
    @Arg("commentText") commentText: string,
    @Ctx("userId") userId: string
  ): Promise<EventComment> {
    console.log(`Creating comment for event ${eventId} by user ${userId}`)
    const id = v4()
    const creationUser = await this.userRepo.findOne(userId)
    const event = await this.eventRepo.findOne(eventId)
    if (!event)
      throw new Error(`Cannot add comment, Event ${eventId} is not found`)

    const comment = {
      id: id,
      commentText: commentText,
      event: event,
      createdBy: creationUser
    }

    await this.commentRepo.create(comment)
    return await this.commentRepo.findOne(id)
  }

  @Authorized()
  @Mutation(returns => EventComment)
  async updateEventComment(
    @Arg("eventId") eventId: string,
    @Arg("commentId") commentId: string,
    @Arg("commentText") commentText: string,
    @Ctx("userId") userId: string
  ): Promise<EventComment> {
    const comment = await this.commentRepo.findOne(commentId)

    //Validate
    if (!comment)
      throw new Error(`Cannot modify comment, Event ${eventId} & Comment ${commentId} is not found`)

    const creationUser = await this.userRepo.findOne(userId)
    if (userId !== creationUser.id)
      throw new UnauthorizedError('credentials_required', {message: `Only the user who created ${commentId} can modify the comment, not user ${userId}`})

    const event = await this.eventRepo.findOne(eventId)
    if (!event)
      throw new Error(`Cannot add comment, Event ${eventId} is not found`)

    //Update
    comment.commentText = commentText
    await this.commentRepo.update(commentId, comment)

    return this.commentRepo.findOne(commentId)
  }
}
