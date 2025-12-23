import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Bus } from "../../buses/entities/Bus";
import { Schedule } from "../../schedules/entities/Schedule";

@Entity("busschedules")
export class BusSchedule {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "integer",
        nullable: false
    })
    schedule_id: number;

    @Column({
        type: "integer",
        nullable: false
    })
    bus_id: number;

    @Column({
        type: "varchar",
        length: 100,
        nullable: true
    })
    operating_days: string;

    @Column({
        type: "json",
        nullable: true,
        default: []
    })
    visited_stops: number[];

    @ManyToOne(() => Schedule, schedule => schedule.busSchedules)
    @JoinColumn({ name: "schedule_id" })
    schedule: Schedule;

    @ManyToOne(() => Bus, bus => bus.busSchedules)
    @JoinColumn({ name: "bus_id" })
    bus: Bus;
}