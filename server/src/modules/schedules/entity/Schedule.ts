import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Route } from "../../routes/entity/Route";

@Entity("schedules")
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ManyToOne(() => Route, (route) => route.schedules, { onDelete: "CASCADE" })
  route_id: number;

  @Column({ type: "time" })
  departure_time: Date;

  @Column({ type: "time" })
  arrival_time: Date;
}