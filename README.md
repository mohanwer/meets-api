# meets-api
Api for creating a copy of meetups.com using auth0, graphql, node, typescript, typeorm.

# Setup
In order to run this locally, the [docker-compose.local.services.yml](https://github.com/mohanwer/meets-api/blob/master/docker-compose.local.services.yml)
will need to be started. This file contains all the services that this appliation uses:
- Postgres
- PgAdmin
- Elasticsearch
- Kibana

Upon first time startup of postgres, the [db/local.sql](https://github.com/mohanwer/meets-api/blob/master/db/local.sql) will have to be run using root in postgres.
This setups the basic schema (meets_node) that is used for the application.

The environment will need to be loaded with settings below. The DEV_USER, DEV_USER_EMAIL are used to against the [config resolver](https://github.com/mohanwer/meets-api/blob/32f99a224b30ecff007954e00101955aa27091d9/src/resolvers/configuration/ConfigResolver.ts#L27) to seed the database with random test data.

| Variable | Value | Description |
| ----------- | ----------- | ----------- |
|AUTH0_DOMAN| devprojecttracker.auth0.com | Auth0 domain.|
|AUTH0_AUDIENCE| meets | Auth0 audience. |
|DEV_USER|google-oauth2| Random ID of your choosing.| This is just the ID of the user that comes from auth 0. For development set it what ever you prefer. |
|DEV_USER_EMAIL| Email address of your choosing. | User email for development. 
|DEV_USER_DISPLAY_NAME| Input whatever name you prefer. | Display name that appears when showing data related to user. |
|GEO_CODIO| Signup for your own at [geocodio.io](https://www.geocod.io/)| Geo codio api key. You will need your own. |
|ELASTIC_HOST|http://localhost:9200| Local address for running elastic service. |
|DB_HOST|localhost| Local address for running postgres instance. |
|DB_PORT|5432| Postgres default port. |
|DB_USER|meets_node| User for this application in postgres. |
|DB_PW|meets| Password for user name above this line. |
|DB_NAME|meets| Schema name associated to this application |
|NODE_ENV|DEV| Running node env. |
|VERSION|1.0.0| Application version. |

# Project structure
The [entity folder](https://github.com/mohanwer/meets-api/tree/master/src/entity) contains classes/entities that represent the data driving the api. The majority of classes are have an @Entity flag and can be found as a table in postgres with the value foundin the @Entity attribute.
Additionally, typegraphql is used to map these entities to GraphQL schema automatically when the application runs.

The [services folder](https://github.com/mohanwer/meets-api/tree/master/src/services) contains external services that are used other than postgres. Currently the project is using elasticsearch and geocodio (for mapping lat/long on addresses).

The [resolvers folders](https://github.com/mohanwer/meets-api/tree/master/src/resolvers) contains all the resolvers created using type-graphql and are organized by entity names.

Testing in this application is done using jest and the [test utils](https://github.com/mohanwer/meets-api/tree/master/src/test-utils) contains the utilities functions that create a test database in postgres and a test graphql schema that connects to the test database.
