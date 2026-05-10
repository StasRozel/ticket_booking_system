import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertAdmin1777755431501 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO roles(name) VALUES ('admin'), ('user'), ('driver'), ('manager');
      INSERT INTO public.users (id, role_id, first_name, last_name, middle_name, phone_number, email, password, count_trips, is_blocked, refresh_token, telegram_id) VALUES (14, 1, 'admin', 'admin', 'admin', '', 'admin@gmail.com', '$2b$10$iz8DO6WTz2fjIpoqtIDCzOf1sqfLbYjml.m8NxbMHNsAjUI.DekHu', 0, false, '', null);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE TABLE roles');
  }
}
