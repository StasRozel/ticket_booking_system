import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Route } from "../../routes/entities/Route";
import { BusSchedule } from "../../busschedules/entities/BusSchedule";

@Entity("schedules")
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  route_id: number;

  @Column({ type: "time" })
  departure_time: Date;

  @Column({ type: "time" })
  arrival_time: Date;

  @ManyToOne(() => Route, (route) => route.schedules)
  @JoinColumn({ name: "route_id" })
  route: Route;

  @OneToMany(() => BusSchedule, busSchedule => busSchedule.schedule)
  busSchedules: BusSchedule[];
}