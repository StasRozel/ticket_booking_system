import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Schedule } from "../../schedules/entities/Schedule";

@Entity("routes")
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255 })
  starting_point: string;

  @Column({ type: "varchar", length: 255 })
  ending_point: string;

  @Column({ type: "text", nullable: true })
  stops: string;

  @Column({ type: "float" })
  distance: number;

  @Column({ type: "float" })
  price: number;

  @OneToMany(() => Schedule, (schedule) => schedule.route_id)
  schedules: Schedule[];
}