import 'reflect-metadata';
import { Body, Controller, Param, Post, Res } from 'routing-controllers';
import { Response } from 'express';
import { login, register } from '../service/service';
@Controller()
export class AuthController {
  @Post("/auth/register/")
  async register(@Body() newUser: any, @Res() res: Response) {
    try {
        const token = await register(newUser);
        return res.status(201).json({ token });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
  }

  @Post("/auth/login/")
  async login(@Body() user: any, @Res() res: Response) {
    try {
        const { email, password } = user;
        const token = await login(email, password);
        return { token };
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
  }
}