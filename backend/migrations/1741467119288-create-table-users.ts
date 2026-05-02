import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTableUsers1741467119288 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE Users (
                id SERIAL PRIMARY KEY,
                role_id INTEGER NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                middle_name VARCHAR(100) NOT NULL,
                phone_number VARCHAR(20) DEFAULT '',
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL,
                count_trips INTEGER DEFAULT 0,
                is_blocked BOOLEAN DEFAULT FALSE,
                refresh_token VARCHAR(255),
                FOREIGN KEY (role_id) REFERENCES Roles(id)
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("Users");
        const foreignKey = table!.foreignKeys.find(fk => fk.columnNames.indexOf("role_id") !== -1);
        await queryRunner.dropForeignKey("Users", foreignKey!);

        await queryRunner.dropTable("Users");
    }
}