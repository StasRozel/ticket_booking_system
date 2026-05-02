import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTableRoutes1741466930091 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE Routes (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                starting_point VARCHAR(100) NOT NULL,
                ending_point VARCHAR(100) NOT NULL,
                stops TEXT,
                distance DECIMAL(10, 2),
                price DECIMAL(10, 2) NOT NULL
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("Routes");
    }
}