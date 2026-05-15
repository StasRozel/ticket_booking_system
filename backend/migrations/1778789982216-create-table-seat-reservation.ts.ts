import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableSeatReservation1778789982216 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE seat_reservations (
          id SERIAL PRIMARY KEY,
          bus_schedule_id INTEGER NOT NULL,
          seat_number INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          boarding_point VARCHAR(100),
          is_child BOOLEAN DEFAULT FALSE,
          price DECIMAL(10, 2),
          status VARCHAR(20) DEFAULT 'reserved',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          FOREIGN KEY (bus_schedule_id) REFERENCES "busschedules"(id),
          FOREIGN KEY (user_id) REFERENCES "users"(id)
        );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE seat_reservations`);
  }
}
