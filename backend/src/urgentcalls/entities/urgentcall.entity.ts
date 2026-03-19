import { BusSchedule } from 'src/busschedules/entities/busschedule.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'urgentcalls' })
export class Urgentcall {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'bus_schedule_id' })
  busScheduleId: number;

  @Column({ name: 'driver_id' })
  driverId: number;

  @Column('double precision', { nullable: true })
  latitude: number | null;

  @Column('double precision', { nullable: true })
  longitude: number | null;

  @Column({ default: false })
  accepted: boolean;

  @ManyToOne(() => BusSchedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bus_schedule_id' })
  busSchedule: BusSchedule;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;
}
