import { createConnection } from "typeorm";

export const testConn = (drop: boolean = false) => {
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
      connectionLimit: 3
    }
  });
};

export default testConn
