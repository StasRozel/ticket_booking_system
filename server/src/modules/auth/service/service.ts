import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../entities/user';
import { userRepository } from '../repository/repository';

const SECRET_KEY = 'your-secret-key';

export const register = async (newUser: any) => {
    const { name, role_id, email, password } = newUser;
    const existingUser = await userRepository.findOneByEmail(email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
        name,
        role_id,
        email,
        password: hashedPassword,
    });

    return generateToken(user);
};

export const login = async (email: string, password: string) => {
    const user = await userRepository.findOneByEmail(email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
    }

    return generateToken(user);
};

const generateToken = (user: User) => {
    return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
        expiresIn: '1h',
    });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, SECRET_KEY);
};