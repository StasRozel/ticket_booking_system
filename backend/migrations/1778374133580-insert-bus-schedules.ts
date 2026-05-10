import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertBusSchedules1778374133580 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$
DECLARE
    day_offset INT;
    route_id INT;
    time_slot INT;
    schedule_id INT;
    bus_id INT;
    year_val INT := 2026;
    month_val INT;
    day_val INT;
    day_of_week INT;
    target_date DATE;
BEGIN
    -- МАЙ 2026
    FOR day_val IN 1..31 LOOP
        target_date := MAKE_DATE(year_val, 5, day_val);
        day_of_week := EXTRACT(DOW FROM target_date)::INT;
        day_offset := CASE day_of_week 
            WHEN 1 THEN 0  -- Понедельник
            WHEN 2 THEN 8  -- Вторник
            WHEN 3 THEN 16 -- Среда
            WHEN 4 THEN 24 -- Четверг
            WHEN 5 THEN 32 -- Пятница
            WHEN 6 THEN 40 -- Суббота
            ELSE 48       -- Воскресенье
        END;
        
        FOR route_id IN 1..11 LOOP
            FOR time_slot IN 0..7 LOOP
                schedule_id := (route_id - 1) * 56 + day_offset + time_slot + 1;
                bus_id := ((route_id - 1) * 8 + time_slot + day_val) % 87 + 1;  
                INSERT INTO BusSchedules (schedule_id, bus_id, operating_days) 
                VALUES (schedule_id, bus_id, target_date);
            END LOOP;
        END LOOP;
    END LOOP;
    
    -- ИЮНЬ 2026
    FOR day_val IN 1..30 LOOP
        target_date := MAKE_DATE(year_val, 6, day_val);
        day_of_week := EXTRACT(DOW FROM target_date)::INT;
        day_offset := CASE day_of_week 
            WHEN 1 THEN 0
            WHEN 2 THEN 8
            WHEN 3 THEN 16
            WHEN 4 THEN 24
            WHEN 5 THEN 32
            WHEN 6 THEN 40
            ELSE 48
        END;
        
        FOR route_id IN 1..11 LOOP
            FOR time_slot IN 0..7 LOOP
                schedule_id := (route_id - 1) * 56 + day_offset + time_slot + 1;
                bus_id := ((route_id - 1) * 8 + time_slot + 31 + day_val) % 87 + 1;
                INSERT INTO BusSchedules (schedule_id, bus_id, operating_days) 
                VALUES (schedule_id, bus_id, target_date);
            END LOOP;
        END LOOP;
    END LOOP;
    
    -- ИЮЛЬ 2026 (1-5 числа)
    FOR day_val IN 1..5 LOOP
        target_date := MAKE_DATE(year_val, 7, day_val);
        day_of_week := EXTRACT(DOW FROM target_date)::INT;
        day_offset := CASE day_of_week 
            WHEN 1 THEN 0
            WHEN 2 THEN 8
            WHEN 3 THEN 16
            WHEN 4 THEN 24
            WHEN 5 THEN 32
            WHEN 6 THEN 40
            ELSE 48
        END;
        
        FOR route_id IN 1..11 LOOP
            FOR time_slot IN 0..7 LOOP
                schedule_id := (route_id - 1) * 56 + day_offset + time_slot + 1;
                bus_id := ((route_id - 1) * 8 + time_slot + 61 + day_val) % 87 + 1;
                INSERT INTO BusSchedules (schedule_id, bus_id, operating_days) 
                VALUES (schedule_id, bus_id, target_date);
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE TABLE BusSchedule');
  }
}
