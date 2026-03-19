import { Driver } from 'src/drivers/entities/driver.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'drivercomplaints' })
export class Complaint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'driver_id' })
  driverId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'complaint_text', type: 'text' })
  complaintText: string;

  @ManyToOne(() => Driver, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
