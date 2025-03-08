import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTableRoles1741465263879 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE Roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL
            );`,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("Roles");
    }

}
