import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BusSchedule } from '../../busschedules/entities/busschedule.entity';
import { User } from '../../users/entities/user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  bus_schedule_id: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  user_id: number;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  booking_date: Date;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  status: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  boarding_point: string;

  @ManyToOne(() => BusSchedule, (busSchedule) => busSchedule.id)
  @JoinColumn({ name: 'bus_schedule_id' })
  busSchedule: BusSchedule;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Ticket, (ticket) => ticket.booking)
  tickets: Ticket[];
}
