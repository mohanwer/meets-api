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
This setups the basic schema, with a db owner [meets_node](https://github.com/mohanwer/meets-api/blob/32f99a224b30ecff007954e00101955aa27091d9/db/local.sql#L13C13-L13C23), that is used for the application.

The environment will need to be loaded with settings below. 
- The DEV_USER, DEV_USER_EMAIL are used to against the [config resolver](https://github.com/mohanwer/meets-api/blob/32f99a224b30ecff007954e00101955aa27091d9/src/resolvers/configuration/ConfigResolver.ts#L27) to seed the database with random test data.
- AUTH0_DOMAN & AUTH0_AUDIENCE must be configured.
- The project is setup with .dotenv and a .env file can be used at the root of the project to load environment vars.

### Environment variables
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

After the env is set ensure to run: `yarn install`

# Project structure
### Entity Folder
The entity folder contains the classes (entities) that represent the core data models of the API. Most are decorated with @Entity, which indicates they map to a corresponding table in PostgreSQL (the table name matches the @Entity value). TypeGraphQL is used to automatically generate the GraphQL schema from these entities at runtime.

### Services Folder
The services folder holds definitions for external services, aside from PostgreSQL. Currently, it includes Elasticsearch and Geocodio (used for address geocoding and latitude/longitude mapping).

### Resolvers Folder
The resolvers folder contains all TypeGraphQL resolvers, organized by the entity they operate on.

### Testing
Jest is used throughout the application for testing. The test-utils folder provides utility functions that set up a PostgreSQL test database and a corresponding GraphQL schema for test execution.

# To run the app:
`yarn start:watch`
