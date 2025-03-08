import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTableBusSchedules1741467137246 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Создание таблицы BusSchedules
        await queryRunner.query(
            `CREATE TABLE BusSchedules (
                id SERIAL PRIMARY KEY,
                schedule_id INTEGER NOT NULL,
                bus_id INTEGER NOT NULL,
                operating_days VARCHAR(100),
                FOREIGN KEY (schedule_id) REFERENCES Schedules(id),
                FOREIGN KEY (bus_id) REFERENCES Buses(id)
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Удаление внешних ключей
        const table = await queryRunner.getTable("BusSchedules");

        const scheduleForeignKey = table!.foreignKeys.find(fk => fk.columnNames.indexOf("schedule_id") !== -1);
        await queryRunner.dropForeignKey("BusSchedules", scheduleForeignKey!);

        const busForeignKey = table!.foreignKeys.find(fk => fk.columnNames.indexOf("bus_id") !== -1);
        await queryRunner.dropForeignKey("BusSchedules", busForeignKey!);

        // Удаление таблицы BusSchedules
        await queryRunner.dropTable("BusSchedules");
    }
}