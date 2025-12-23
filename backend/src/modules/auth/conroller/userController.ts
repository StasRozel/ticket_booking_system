import 'reflect-metadata';
import { Controller, Param, Body, Get, Patch } from 'routing-controllers';
import { userRepository } from '../repository/repository';
import { User } from '../entities/user';

@Controller("/api/users")
export class UserController {
  @Get("/")
  async getAll() {
    return await userRepository.findAll();
  }

  @Get("/:id")
  async getUserById(@Param('id') id: number) {
    return await userRepository.findOneById(id);
  }

  @Patch("/update/:id")
  async update(@Param('id') id: number, @Body() user: User) {
    return await userRepository.update(id, user);
  }

  @Patch("/blocked/:id")
  async updateUserById(@Param('id') id: number, @Body() user: User) {
    return await userRepository.update(id, user);
  }

  @Get('/:id/tickets')
  async getUserWithTickets(@Param('id') id: number) {
    return await userRepository.findOneWithTickets(id);
  }
}