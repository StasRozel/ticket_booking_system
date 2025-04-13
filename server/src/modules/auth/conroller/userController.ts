import 'reflect-metadata';
import { Controller, Param, Body, Get, Patch } from 'routing-controllers';
import { userRepository } from '../repository/repository';
import { User } from '../entities/user';

@Controller("/users")
export class UserController {
  @Get("/")
  async getAll() {
    return await userRepository.findAll();
  }

  @Get("/:id")
  async getBusById(@Param('id') id: number) {
    return await userRepository.findOneById(id);
  }

  @Patch("/blocked/:id")
  async updateBusById(@Param('id') id: number, @Body() user: User) {
    return await userRepository.update(id, user);
  }
}