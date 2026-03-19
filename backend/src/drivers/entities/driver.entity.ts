import { Bus } from 'src/buses/entities/bus.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'user_id',
    type: 'integer',
    nullable: false,
  })
  user_id: number;

  @Column({
    name: 'bus_id',
    type: 'integer',
    nullable: false,
  })
  bus_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Bus)
  @JoinColumn({ name: 'bus_id' })
  bus: Bus;
}
