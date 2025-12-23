import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableUrgentCalls1766236223835 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE UrgentCalls (
                id SERIAL PRIMARY KEY,
                bus_schedule_id INTEGER NOT NULL,
                driver_id INTEGER NOT NULL,
                latitude DOUBLE PRECISION,
                longitude DOUBLE PRECISION,
                accepted BOOLEAN DEFAULT false,
                FOREIGN KEY (bus_schedule_id) REFERENCES BusSchedules(id),
                FOREIGN KEY (driver_id) REFERENCES Drivers(id)
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
