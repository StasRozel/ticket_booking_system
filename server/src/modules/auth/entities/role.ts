import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ 
        type: 'varchar', 
        length: 50, 
        nullable: false 
    })
    name: string;

    // Связь один-ко-многим с таблицей Users
    @OneToMany(() => User, user => user.role)
    users: User[];
}