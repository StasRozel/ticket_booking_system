import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTriggerCountTrips1746521451825 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
CREATE OR REPLACE FUNCTION increment_user_trips()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'истек' AND OLD.status != 'истек' THEN
        UPDATE Users
        SET count_trips = count_trips + 1
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_trips_trigger
AFTER UPDATE OF status ON Bookings
FOR EACH ROW
EXECUTE FUNCTION increment_user_trips();
            `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
