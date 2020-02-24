import { ConnectionOptions } from "typeorm";

export const dbConnection = (): ConnectionOptions => ({
  name: "default",
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PW,
  synchronize: true,
  logging: false,
  cache: true,
  entities: [__dirname + "/../entity/*.*"],
  migrations: [__dirname + "/../migration/**/*.ts"],
  subscribers: [__dirname + "/../subscriber/**/*.ts"],
})