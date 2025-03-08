import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTableSchedules1741467104604 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE Schedules (
                id SERIAL PRIMARY KEY,
                route_id INTEGER NOT NULL,
                departure_time TIME NOT NULL,
                arrival_time TIME NOT NULL,
                FOREIGN KEY (route_id) REFERENCES Routes(id)
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("Schedules");
        const foreignKey = table!.foreignKeys.find(fk => fk.columnNames.indexOf("route_id") !== -1);
        await queryRunner.dropForeignKey("Schedules", foreignKey!);

        await queryRunner.dropTable("Schedules");
    }
}