import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user';
import { BusSchedule } from '../../busschedules/entities/BusSchedule';
import { Ticket } from '../../tickets/entities/tickets';

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({
        type: 'integer',
        nullable: false
    })
    bus_schedule_id: number;

    @Column({
        type: 'integer',
        nullable: false
    })
    user_id: number;

    @Column({
        type: 'timestamp with time zone',
        nullable: false
    })
    booking_date: Date;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: false
    })
    status: string;

    @ManyToOne(() => BusSchedule, busSchedule => busSchedule.id)
    @JoinColumn({ name: 'bus_schedule_id' })
    busSchedule: BusSchedule;

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Ticket, ticket => ticket.booking)
    tickets: Ticket[];
}