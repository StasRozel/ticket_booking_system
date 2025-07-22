// src/controllers/AuthController.ts
import 'reflect-metadata';
import { Body, Controller, Post, Res } from 'routing-controllers';
import { Response } from 'express';
import { login, register, refreshAccessToken, logout } from '../services/service';

@Controller()
export class AuthController {
    @Post('/api/auth/register/')
    async register(
        @Body() newUser: any,
        @Res() res: Response
    ) {
        try {
            const { user_id, accessToken, refreshToken } = await register(newUser);
            return res.status(201).json({ user_id, accessToken, refreshToken });
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    }

    @Post('/api/auth/login/')
    async login(
        @Body() user: { email: string; password: string },
        @Res() res: Response
    ) {
        try {
          const { email, password } = user;
            const { user_id, accessToken, refreshToken, isAdmin, isBlocked } = await login(email, password);
            return res.status(200).json({ user_id, accessToken, refreshToken, isAdmin, isBlocked });
        } catch (error) {
            return res.status(401).json({ message: (error as Error).message });
        }
    }

    @Post('/api/auth/refresh/')
    async refresh(
        @Body() body: { refresh_token: string },
        @Res() res: Response
    ) {
        try {
            const { refresh_token } = body;
            const { accessToken } = await refreshAccessToken(refresh_token);
            return res.status(200).json({ accessToken });
        } catch (error) {
            return res.status(401).json({ message: (error as Error).message });
        }
    }

    @Post('/api/auth/logout/')
    async logout(
        @Body() body: { refreshToken: string },
        @Res() res: Response
    ) {
        try {
            const { refreshToken } = body;
            await logout(refreshToken);
            return res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    }
}