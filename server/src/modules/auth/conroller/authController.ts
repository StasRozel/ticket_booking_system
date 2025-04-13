// src/controllers/AuthController.ts
import 'reflect-metadata';
import { Body, Controller, Post, Res } from 'routing-controllers';
import { Response } from 'express';
import { login, register, refreshAccessToken, logout } from '../services/service';

@Controller()
export class AuthController {
    @Post('/auth/register/')
    async register(
        @Body() newUser: any,
        @Res() res: Response
    ) {
        try {
            const { accessToken, refreshToken } = await register(newUser);
            return res.status(201).json({ accessToken, refreshToken });
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    }

    @Post('/auth/login/')
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

    @Post('/auth/refresh/')
    async refresh(
        @Body() body: { refreshToken: string },
        @Res() res: Response
    ) {
        try {
            const { refreshToken } = body;
            const { accessToken } = await refreshAccessToken(refreshToken);
            return res.status(200).json({ accessToken });
        } catch (error) {
            return res.status(401).json({ message: (error as Error).message });
        }
    }

    @Post('/auth/logout/')
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