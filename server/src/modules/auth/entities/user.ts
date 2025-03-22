import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ 
        name: 'role_id',
        nullable: false 
    })
    role_id: number;

    @Column({ 
        type: 'varchar', 
        length: 100, 
        nullable: false 
    })
    name: string;

    @Column({ 
        type: 'varchar', 
        length: 100, 
        unique: true, 
        nullable: false 
    })
    email: string;

    @Column({ 
        type: 'varchar', 
        length: 100, 
        nullable: false 
    })
    password: string;

    @Column({ 
        type: 'boolean', 
        default: false 
    })
    is_blocked: boolean;

    @Column({ 
        type: 'varchar', 
        length: 255, 
        nullable: true,
     }) 
    refresh_token: string;

    @ManyToOne(() => Role, role => role.users)
    @JoinColumn({ name: 'role_id' })
    role: Role;
}