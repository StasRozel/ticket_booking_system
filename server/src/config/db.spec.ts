import { DataSource } from "typeorm";
import { Route } from "../modules/routes/entity/Route";
import { Schedule } from "../modules/schedules/entity/Schedule";

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
    entities: [Route, Schedule],
})

