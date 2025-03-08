import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTableBuses1741467094065 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE Buses (
                id SERIAL PRIMARY KEY,
                bus_number VARCHAR(20) NOT NULL,
                capacity INTEGER NOT NULL,
                type VARCHAR(50),
                available BOOLEAN DEFAULT TRUE
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("Buses");
    }
}