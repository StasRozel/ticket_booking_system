import 'reflect-metadata';
import { Controller, Param, Body, Get, Post, Put, Delete, Patch } from 'routing-controllers';
import { scheduleRepository } from '../repository/repository';
import { Schedule } from '../entity/Schedule';

@Controller()
export class ScheduleController {
  @Get("/schedules/")
  async getAll() {
    return await scheduleRepository.findAll();
  }

  @Get("/schedules/:id")
  async getScheduleById(@Param('id') id: number) {
    return await scheduleRepository.findOneById(id);
  }

  @Post("/schedules/create/")
  async createSchedule(@Body() schedule: Schedule) {
    return await scheduleRepository.create(schedule);
  }

  @Patch("/schedules/update/:id")
  async updateScheduleById(@Param('id') id: number, @Body() schedule: Schedule) {
    return await scheduleRepository.update(id, schedule);
  }

  @Delete("/schedules/delete/:id")
  async deleteScheduleById(@Param('id') id: number) {
    return await scheduleRepository.delete(id);
  }
}