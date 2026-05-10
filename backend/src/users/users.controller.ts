import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from './jwt.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('/auth/register/')
  async register(@Body() newUser: CreateUserDto) {
    try {
      const { user_id, accessToken, refreshToken } =
        await this.usersService.register(newUser);
      return { user_id, accessToken, refreshToken };
    } catch (error) {
      throw new HttpException((error as Error).message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/auth/login/')
  async login(@Body() user: { email: string; password: string }) {
    try {
      const { email, password } = user;
      const { user_id, accessToken, refreshToken, isAdmin, isBlocked } =
        await this.usersService.login(email, password);
      return { user_id, accessToken, refreshToken, isAdmin, isBlocked };
    } catch (error) {
      throw new HttpException(
        (error as Error).message,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('/auth/refresh/')
  async refresh(@Body() body: { refresh_token: string }) {
    try {
      const { refresh_token } = body;
      const { accessToken } =
        await this.jwtService.refreshAccessToken(refresh_token);
      return { accessToken };
    } catch (error) {
      throw new HttpException(
        (error as Error).message,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('/auth/logout/')
  async logout(@Body() body: { refreshToken: string }) {
    try {
      const { refreshToken } = body;
      await this.usersService.logout(refreshToken);
      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new HttpException((error as Error).message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Get('/:id/tickets')
  async getUserWithTickets(@Param('id') id: number) {
    return await this.usersService.findTicketsUser(id);
  }

  @Patch('/blocked/:id')
  async updateUserById(@Param('id') id: number, @Body() user: UpdateUserDto) {
    return await this.usersService.update(id, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
