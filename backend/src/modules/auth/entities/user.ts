import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Role } from './role';
import { Booking } from '../../bookings/entities/booking';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'role_id',
        type: 'integer',
        nullable: false
    })
    role_id: number;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false
    })
    first_name: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false
    })
    last_name: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false
    })
    middle_name: string;

    @Column({
        type: 'varchar',
        length: 20,
        default: ''
    })
    phone_number: string;

    @Column({
        type: 'varchar',
        length: 100,
        unique: true,
        nullable: false
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false
    })
    password: string;

    @Column({
        type: 'integer',
        default: 0
    })
    count_trips: number;

    @Column({
        type: 'boolean',
        default: false
    })
    is_blocked: boolean;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true
    })
    refresh_token: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true
    })
    telegram_id: string;

    @ManyToOne(() => Role, role => role.users)
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @OneToMany(() => Booking, booking => booking.user)
    bookings: Booking[];
}