import { createConnection } from "typeorm";

export const testConn = (drop: boolean = false) => {
  //Todo: Need to to store this in config file.
  return createConnection({
    name: "default",
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "meets_node",
    password: "meets",
    database: "meets_test",
    synchronize: drop,
    dropSchema: drop,
    maxQueryExecutionTime: 300000,
    entities: [__dirname + "/../entity/*.*"],
    extra: {
      connectionLimit: 1 // We can only use one connection otherwise there can be db concurrency errors during testing.
    }
  });
};

export default testConn
