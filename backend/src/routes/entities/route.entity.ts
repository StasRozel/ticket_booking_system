import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  starting_point: string;

  @Column({ type: 'varchar', length: 100 })
  ending_point: string;

  @Column({ type: 'text', nullable: true })
  stops: string;

  @Column({ type: 'numeric' })
  distance: number;

  @Column({ type: 'numeric' })
  price: number;

  @OneToMany(() => Schedule, (schedule) => schedule.route)
  schedules: Schedule[];
}
