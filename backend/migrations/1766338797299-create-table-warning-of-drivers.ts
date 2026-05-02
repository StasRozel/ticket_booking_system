import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableWarningOfDrivers1766338797299 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE DriverComplaints (
                id SERIAL PRIMARY KEY,
                driver_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                complaint_text TEXT NOT NULL,
                FOREIGN KEY (driver_id) REFERENCES Drivers(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
