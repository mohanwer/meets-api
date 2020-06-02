import {
  Arg,
  Mutation,
  Query,
  Resolver,
  Ctx,
  Authorized,
} from "type-graphql";
import { User } from "../../entity/User";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { UserInput } from "./user-input";

@Resolver(User)
export class UserResolver {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) {}

  @Query((returns) => User, { nullable: true })
  async getUser(@Arg("id") id: string): Promise<User | undefined> {
    return await this.userRepo.findOne(id);
  }

  @Mutation((returns) => User)
  async addUser(
    @Arg("userData") userData: UserInput
  ): Promise<User | undefined> {
    const newUser = this.userRepo.create({ ...userData });
    return await this.userRepo.save(newUser);
  }

  // Whenever a user signs on the UI via auth0 this method should be called.
  // It will check if the user is stored and up to date in the users table.
  @Authorized()
  @Mutation((returns) => User, { nullable: true })
  async updateUser(
    @Ctx("userId") userId: string,
    @Arg("email") email: string,
    @Arg("displayName") displayName: string
  ): Promise<User | undefined> {
    const userSignedIn = await this.userRepo.findOne({ id: userId });

    // If the user is accurately stored in Users then do nothing.
    if (
      userSignedIn?.email == email &&
      userSignedIn?.displayName == displayName
    )
      return userSignedIn;

    // If the user is signed in email / displayname are out of date from what's
    // in Auth0 then perform an update.
    if (userSignedIn) {
      const updatedUser = {
        email: email,
        displayName: displayName,
      };
      await this.userRepo.update(userId, updatedUser);
      return userSignedIn;
    }

    // No user was found. Creating one.
    const newUser = {
      id: userId,
      email: email,
      displayName: displayName,
    };

    return this.userRepo.create(newUser).save();
  }
}
