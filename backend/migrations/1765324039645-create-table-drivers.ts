import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableDrivers1765324039645 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE Drivers (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                bus_id INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES Users(id), 
                FOREIGN KEY (bus_id) REFERENCES Buses(id)
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
