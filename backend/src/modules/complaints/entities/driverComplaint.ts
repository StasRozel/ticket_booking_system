import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Driver } from "../../drivers/entities/driver";
import { User } from "../../auth/entities/user";

@Entity({ name: "drivercomplaints" })
export class DriverComplaint {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "driver_id" })
    driverId: number;

    @Column({ name: "user_id" })
    userId: number;

    @Column({ name: "complaint_text", type: "text" })
    complaintText: string;

    @ManyToOne(() => Driver, { onDelete: "CASCADE" })
    @JoinColumn({ name: "driver_id" })
    driver: Driver;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;
}
