import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Booking } from '../../bookings/entities/booking';

@Entity('tickets')
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'integer',
        nullable: false
    })
    booking_id: number;

    @Column({
        type: 'integer',
        nullable: false
    })
    seat_number: number;

    @Column({
        type: 'boolean',
        nullable: false,
        default: false
    })
    is_child: boolean;

    @Column({
        type: 'numeric',
        precision: 10,
        scale: 2,
        nullable: false
    })
    price: number;

    @ManyToOne(() => Booking, booking => booking.id)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;
}