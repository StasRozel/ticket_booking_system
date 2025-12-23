import { DataSource } from "typeorm";

import dotenv from "dotenv";
dotenv.config();

export const AppDataSource = new DataSource({
    type:  'postgres',
    host: 'db',
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME ,
    password: String(process.env.DB_PASSWRD),
    database: process.env.DB_NAME,
    synchronize: false,
    entities: ["src/modules/**/entities/*.ts"],
    migrations: ["src/migrations/*.ts"], 
    logging: false,
})

