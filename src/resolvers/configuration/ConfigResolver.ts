import { Arg, Resolver, Query, Mutation, Authorized } from 'type-graphql'
import { ConfigSettings, SeedResult } from '../../entity';
import { seedEvents } from '../../test-utils/seed';
import { ApolloError } from 'apollo-server-express';

const { VERSION, NODE_ENV, DEV_USER, DB_HOST, ELASTIC_HOST } = process.env
const NOT_AVAILABLE = 'NOT AVAILABLE IN NON-DEVELOPMENT ENVIRONMENT'
const DEVELOPMENT = 'DEV'

@Resolver(of => ConfigResolver)
export class ConfigResolver {

  @Query(returns => ConfigSettings)
  config() {
    const devUser = NODE_ENV == DEVELOPMENT ? DEV_USER : NOT_AVAILABLE
    const elasticHost = NODE_ENV == DEVELOPMENT ? ELASTIC_HOST : NOT_AVAILABLE
    const dbHost = NODE_ENV == DEVELOPMENT ? DB_HOST : NOT_AVAILABLE
    return {
      version: VERSION,
      environment: NODE_ENV,
      devUser: devUser,
      elasticHost: elasticHost,
      databaseHost: dbHost,
    }
  }

  @Mutation(returns => [SeedResult])
  async seedWithFakeData(): Promise<SeedResult[]> {
    if (NODE_ENV != DEVELOPMENT)
      throw new ApolloError(NOT_AVAILABLE)

    const seedResults = await seedEvents()
    
    return seedResults
  }
}