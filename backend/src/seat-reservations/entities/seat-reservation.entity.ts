import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { BusSchedule } from '../../busschedules/entities/busschedule.entity';
import { User } from '../../users/entities/user.entity';

@Entity('seat_reservations')
export class SeatReservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  bus_schedule_id: number;

  @Column({ type: 'integer', nullable: false })
  seat_number: number;

  @Column({ type: 'integer', nullable: false })
  user_id: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  boarding_point: string;

  @Column({ type: 'boolean', default: false })
  is_child: boolean;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'reserved',
  })
  status: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @Column({ type: 'timestamp with time zone' })
  expires_at: Date;

  @ManyToOne(() => BusSchedule, (busSchedule) => busSchedule.id)
  @JoinColumn({ name: 'bus_schedule_id' })
  busSchedule: BusSchedule;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}