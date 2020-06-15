# meets-api
Api for creating a copy of meetups.com using auth0, graphql, node, typescript, typeorm.

In order to run this locally, the [docker-compose.local.services.yml](https://github.com/mohanwer/meets-api/blob/master/docker-compose.local.services.yml)
will need to be started. This file contains all the services that this appliation uses:
- Postgres
- PgAdmin
- Elasticsearch
- Kibana

Upon first time startup of postgres, the [db/local.sql](https://github.com/mohanwer/meets-api/blob/master/db/local.sql) will have to be run using root in postgres.
This setups the basic schema (meets_node) that is used for the application.

# Project structure
The [entity folder](https://github.com/mohanwer/meets-api/tree/master/src/entity) contains classes/entities that represent the data driving the api. The majority of classes are have an @Entity flag and can be found as a table in postgres with the value foundin the @Entity attribute.
Additionally, typegraphql is used to map these entities to GraphQL schema automatically when the application runs.

The [services folder](https://github.com/mohanwer/meets-api/tree/master/src/services) contains external services that are used other than postgres. Currently the project is using elasticsearch and geocodio (for mapping lat/long on addresses).

The [resolvers folders](https://github.com/mohanwer/meets-api/tree/master/src/resolvers) contains all the resolvers created using type-graphql and are organized by entity names.

Testing in this application is done using jest and the [test utils](https://github.com/mohanwer/meets-api/tree/master/src/test-utils) contains the utilities functions that create a test database in postgres and a test graphql schema that connects to the test database.
