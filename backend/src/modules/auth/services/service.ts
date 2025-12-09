import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../entities/user';
import { userRepository } from '../repository/repository';
require('dotenv');

const log = (...args: any[]) => console.log('\x1b[36m', '[auth-service]', ...args);

const getAccessSecret = () => {
    const s = process.env.ACCESS_TOKEN_SECRET;
    if (!s) throw new Error('ACCESS_TOKEN_SECRET not set');
    return s;
}

const getRefreshSecret = () => {
    const s = process.env.REFRESH_TOKEN_SECRET;
    if (!s) throw new Error('REFRESH_TOKEN_SECRET not set');
    return s;
}

export const register = async (newUser: any) => {
    const { first_name, last_name, middle_name, role_id, email, password } = newUser;
    log('register called for', email);
    const existingUser = await userRepository.findOneByEmail(email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
        first_name, last_name, middle_name,
        role_id,
        email,
        password: hashedPassword,
    });

    const { accessToken, refreshToken } = generateTokens(user);
    log('generated tokens for user', user.id, { accessTokenExists: !!accessToken, refreshTokenExists: !!refreshToken });
    const user_id = user.id;
    user.refresh_token = refreshToken;
    await userRepository.save(user);

    return { user_id, accessToken, refreshToken };
};

export const login = async (email: string, password: string) => {
    let isAdmin = false;
    log('login called for', email);
    const user = await userRepository.findOneByEmail(email);
    const user_id = user?.id;
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
    }

    if (user.role_id == 1) {
        isAdmin = true;
    }

    const { accessToken, refreshToken } = generateTokens(user);
    log('generated tokens for login', user.id, { accessTokenExists: !!accessToken, refreshTokenExists: !!refreshToken });
    
    user.refresh_token = refreshToken;
    let isBlocked = user.is_blocked;
    await userRepository.save(user);

    return { user_id, accessToken, refreshToken, isAdmin, isBlocked };
};

export const refreshAccessToken = async (refreshToken: string) => {
    const user = await userRepository.findOne( { refresh_token: refreshToken } );
    if (!user) {
        throw new Error('Invalid refresh token');
    }

    try {
        const secret = getRefreshSecret();
        log('verifying refresh token with secret present:', !!secret);
        jwt.verify(refreshToken, secret);
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
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, getRefreshSecret(), {
        expiresIn: '7d',
    });
    return { accessToken, refreshToken };
};

const generateAccessToken = (user: User) => {
    return jwt.sign({ id: user.id, email: user.email }, getAccessSecret(), {
        expiresIn: '15m',
    });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};