import { DataSource } from "typeorm";
import { Route } from "../routes/entity/Route";
require('dotenv').config();

export const AppDataSource = new DataSource({
    type:  'postgres',
    host: process.env.HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME ,
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [Route],
})

