import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  getAccessSecret = () => {
    const s = process.env.ACCESS_TOKEN_SECRET;
    if (!s) throw new Error('ACCESS_TOKEN_SECRET not set');
    return s;
  };

  getRefreshSecret = () => {
    const s = process.env.REFRESH_TOKEN_SECRET;
    if (!s) throw new Error('REFRESH_TOKEN_SECRET not set');
    return s;
  };

  generateTokens = (
    user: CreateUserDto,
  ): { accessToken: string; refreshToken: string } => {
    try {
      const accessToken: string = this.generateAccessToken(user);
      const refreshToken: string = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        this.getRefreshSecret(),
        {
          expiresIn: '7d',
        },
      );
      return { accessToken, refreshToken };
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(err.message);
        return { accessToken: '', refreshToken: '' };
      } else {
        console.log(String(err));
        return { accessToken: '', refreshToken: '' };
      }
    }
  };

  generateAccessToken = (user: CreateUserDto): string => {
    return jwt.sign(
      { id: user.id, email: user.email },
      this.getAccessSecret(),
      {
        expiresIn: '15m',
      },
    );
  };

  verifyAccessToken = (token: string): string => {
    return jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
    ) as string;
  };

  refreshAccessToken = async (refreshToken: string) => {
    const user = await this.userRepository.findOne({
      where: { refresh_token: refreshToken },
    });
    if (!user) {
      throw new Error('Invalid refresh token');
    }

    try {
      const secret = this.getRefreshSecret();
      jwt.verify(refreshToken, secret);
    } catch (error) {
      console.log(error);
      throw new Error('Invalid refresh token');
    }

    const accessToken = this.generateAccessToken(user);
    return { accessToken };
  };
}
