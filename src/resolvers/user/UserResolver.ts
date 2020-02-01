import {Arg, Mutation, Query, Resolver} from 'type-graphql'
import {User} from '../../entity/User'
import {Repository} from 'typeorm'
import {InjectRepository} from 'typeorm-typedi-extensions'
import {UserInput} from './user-input'

@Resolver()
export class UserResolver {

  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  @Query(returns => User, {nullable: true})
  async getUser(@Arg("id") id: string): Promise<User | undefined> {
    return await this.userRepo.findOne(id)
  }

  @Mutation(returns => User)
  async addUser(@Arg("userData") userData: UserInput): Promise<User> {
    console.log(JSON.stringify(userData, null, 2))
    await this.userRepo.insert({...userData})
    return await this.userRepo.findOne(userData.id)
  }
}
