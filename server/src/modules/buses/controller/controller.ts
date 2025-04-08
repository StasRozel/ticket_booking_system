import 'reflect-metadata';
import { Controller, Param, Body, Get, Post, Put, Delete, Patch } from 'routing-controllers';
import { Bus } from "../entities/Bus";
import { busRepository } from '../repository/repository';

@Controller("/buses")
export class BusController {
  @Get("/")
  async getAll() {
    return await busRepository.findAll();
  }

  @Get("/:id")
  async getBusById(@Param('id') id: number) {
    return await busRepository.findOneById(id);
  }

  @Post("/create/")
  async createBus(@Body() route: Bus) {
    return await busRepository.create(route);
  }

  @Patch("/update/:id")
  async updateBusById(@Param('id') id: number, @Body() route: Bus) {
    return await busRepository.update(id, route);
  }

  @Delete("/delete/:id")
  async deleteBusById(@Param('id') id: number) {
    return await busRepository.delete(id);
  }
}