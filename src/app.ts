//Setup env variables
import { config } from "dotenv";
config();

import "reflect-metadata";
import * as express from "express";
import * as cors from "cors";
import * as jwt from "express-jwt";
import * as jwksRsa from "jwks-rsa";
import { ApolloServer } from "apollo-server-express";
import { createConnection, useContainer } from "typeorm";
import { buildSchema } from "type-graphql";
import { schemaOptions } from "./resolvers";
import { Container } from "typedi";
import { createEventIndex } from "./services/elastic";
import { dbConnection } from "./config/ormconfig";
import * as bodyParser from "body-parser";

(async () => {
  //Data setup
  useContainer(Container);
  const connectionDetails = dbConnection();

  await createConnection(connectionDetails);
  await createEventIndex();
  const schema = await buildSchema(schemaOptions);

  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  //Auth setup
  const authConfig = {
    domain: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_AUDIENCE,
  };

  const authMiddleware = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
    }),
    audience: authConfig.audience,
    issuer: `https://${authConfig.domain}/`,
    algorithm: ["RS256"],
    credentialsRequired: false,
  });

  app.use(authMiddleware);

  app.use(function (err, req, res, next) {
    const errorObject = { error: true, message: `${err.name}: ${err.message}` };
    if (err.name === "UnauthorizedError") {
      return res.status(401).json(errorObject);
    } else {
      return res.status(400).json(errorObject);
    }
  });

  const server = new ApolloServer({
    schema,
    tracing: true,
    cacheControl: true,
    engine: false,
    playground: true,
    debug: true,
    context: ({ req }) => {
      let nreq = <any>req;

      // Todo: Come up with a better way to handle this.
      // When in development, if there is no user on the context
      // this assigns the dev user. It allows us to test end points without
      // having auth jwt tokens on request headers.
      if (!nreq?.user) return { userId: process.env.DEV_USER, req: req };

      // Assign values from auth0 jwt to context.
      const { sub } = nreq.user;

      return {
        userId: sub,
        req: req,
      };
    },
  });

  server.applyMiddleware({ app });

  app.listen({ port: 5000 }, async () => {
    console.log(
      `🚀 Server ready at http://localhost:${5000}${server.graphqlPath}`
    );
    let err;
    if (err) {
      console.error("Error: Cannot connect to database");
    } else {
      console.log("Connected to database");
    }
  });
})();
