import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role'; // Предполагается, что существует сущность Role

@Entity('users') // Имя таблицы в базе данных
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

    // Связь многие-к-одному с таблицей Roles
    @ManyToOne(() => Role, role => role.users)
    @JoinColumn({ name: 'role_id' })
    role: Role;
}