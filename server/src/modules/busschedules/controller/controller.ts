import 'reflect-metadata';
import { Controller, Param, Body, Get, Post, Put, Delete, Patch } from 'routing-controllers';
import { busScheduleRepository } from '../repository/repository';
import { BusSchedule } from '../entities/BusSchedule';

@Controller("/bus-schedules")
export class BusScheduleController {
  @Get("/")
  async getAll() {
    return await busScheduleRepository.findAll();
  }

  @Get("/:id")
  async getBusById(@Param('id') id: number) {
    return await busScheduleRepository.findOneById(id);
  }

  @Post("/create/")
  async createBus(@Body() route: BusSchedule) {
    return await busScheduleRepository.create(route);
  }

  @Patch("/update/:id")
  async updateBusById(@Param('id') id: number, @Body() route: BusSchedule) {
    return await busScheduleRepository.update(id, route);
  }

  @Delete("/delete/:id")
  async deleteBusById(@Param('id') id: number) {
    return await busScheduleRepository.delete(id);
  }
}