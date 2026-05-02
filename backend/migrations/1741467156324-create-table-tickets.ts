import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTableTickets1741467156324 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE Tickets (
                id SERIAL PRIMARY KEY,
                booking_id INTEGER NOT NULL,
                seat_number INTEGER NOT NULL,
                is_child BOOLEAN DEFAULT FALSE,
                price DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (booking_id) REFERENCES Bookings(id)
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("Tickets");
        
        const bookingForeignKey = table!.foreignKeys.find(fk => fk.columnNames.indexOf("booking_id") !== -1);
        await queryRunner.dropForeignKey("Tickets", bookingForeignKey!);

        await queryRunner.dropTable("Tickets");
    }
}