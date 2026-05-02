import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTableBookings1741467151035 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE Bookings (
                id SERIAL PRIMARY KEY,
                bus_schedule_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) NOT NULL,
                FOREIGN KEY (bus_schedule_id) REFERENCES BusSchedules(id),
                FOREIGN KEY (user_id) REFERENCES Users(id)
            );`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("Bookings");
        
        const busScheduleForeignKey = table!.foreignKeys.find(fk => fk.columnNames.indexOf("bus_schedule_id") !== -1);
        await queryRunner.dropForeignKey("Bookings", busScheduleForeignKey!);

        const userForeignKey = table!.foreignKeys.find(fk => fk.columnNames.indexOf("user_id") !== -1);
        await queryRunner.dropForeignKey("Bookings", userForeignKey!);

        await queryRunner.dropTable("Bookings");
    }
}