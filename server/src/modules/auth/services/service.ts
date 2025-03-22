import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../entities/user';
import { userRepository } from '../repository/repository';

const ACCESS_TOKEN_SECRET = 'your-access-token-secret';
const REFRESH_TOKEN_SECRET = 'your-refresh-token-secret';

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

    const { accessToken, refreshToken } = generateTokens(user);
    
    user.refresh_token = refreshToken;
    await userRepository.save(user);

    return { accessToken, refreshToken };
};

export const login = async (email: string, password: string) => {
    let isAdmin = false;
    const user = await userRepository.findOneByEmail(email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
    }

    if (user.role_id == 1) {
        isAdmin = true;
    }

    const { accessToken, refreshToken } = generateTokens(user);
    
    user.refresh_token = refreshToken;
    await userRepository.save(user);

    return { accessToken, refreshToken, isAdmin };
};

export const refreshAccessToken = async (refreshToken: string) => {
    const user = await userRepository.findOne( { refreshToken } );
    if (!user) {
        throw new Error('Invalid refresh token');
    }

    try {
        jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new Error('Invalid refresh token');
    }

    const accessToken = generateAccessToken(user);
    return { accessToken };
};

export const logout = async (refresh_token: string) => {
    const user = await userRepository.findOne( { refresh_token } );
    if (user) {
        user.refresh_token = null;
        await userRepository.save(user);
    }
};

const generateTokens = (user: User) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });
    return { accessToken, refreshToken };
};

const generateAccessToken = (user: User) => {
    return jwt.sign({ id: user.id, email: user.email }, ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
    });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
};