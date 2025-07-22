import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { BusSchedule } from "../../busschedules/entities/BusSchedule";

@Entity("buses")
export class Bus {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        length: 20,
        nullable: false
    })
    bus_number: string;

    @Column({
        type: "int",
        array: true,
        nullable: false
    })
    capacity: number[];

    @Column({
        type: "varchar",
        length: 50,
        nullable: true
    })
    type: string;

    @Column({
        type: "boolean",
        default: true
    })
    available: boolean;

    @OneToMany(() => BusSchedule, busSchedule => busSchedule.bus)
    busSchedules: BusSchedule[];
}