import "reflect-metadata"
import * as express  from 'express'
import * as jwt from 'express-jwt'
import * as jwksRsa from 'jwks-rsa'
import { config } from 'dotenv'
import { ApolloServer } from 'apollo-server-express'
import { createConnection, useContainer } from 'typeorm'
import { buildSchema } from 'type-graphql'
import { schemaOptions } from './resolvers'
import { Container } from 'typedi'

(async() => {
  useContainer(Container)
  await createConnection()
  const schema = await buildSchema(schemaOptions)
  config()
  const app = express()

  const authConfig = {
    domain: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_AUDIENCE
  }

  const authMiddleware = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
    }),
    audience: authConfig.audience,
    issuer: `https://${authConfig.domain}/`,
    algorithm: ["RS256"],
    credentialsRequired: false
  })

  app.use(authMiddleware);

  app.use(function (err, req, res, next) {
    const errorObject = {error: true, message: `${err.name}: ${err.message}`};
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json(errorObject);
    } else {
      return res.status(400).json(errorObject);
    }
  })

  const server = new ApolloServer({
    schema,
    tracing: true,
    cacheControl: true,
    engine: false,
    playground: true,
    context: ({ req }) => {
      let nreq = <any> req;

      //Todo: Come up with a better way to handle this.
      if (!nreq.user)
        return ({userId: process.env.DEV_USER, req: req})

      let user = nreq.user.sub;
      return {
        userId: user, req: req
      };
    }
  })
  server.applyMiddleware({ app });

  app.listen({ port: 3000 }, async () => {
    console.log(`🚀 Server ready at http://localhost:${3000}${server.graphqlPath}`);
    let err;
    if(err){
      console.error('Error: Cannot connect to database');
    } else {
      console.log('Connected to database');
    }
  })
})();

