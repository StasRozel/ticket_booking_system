import 'reflect-metadata';
import { Controller, Param, Body, Get, Post, Put, Delete, Patch, HttpError } from 'routing-controllers';
import { scheduleRepository } from '../repository/repository';
import { Schedule } from '../entities/Schedule';
import { scheduleService } from '../service/service';

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
    const result = await scheduleService.createSchedule(schedule);
    if (!result.success) {
      throw new HttpError(400, result.error);
    }
    return result.data;
  }

  @Patch("/schedules/update/:id")
  async updateScheduleById(@Param('id') id: number, @Body() schedule: Schedule) {
    const result = await scheduleService.updateSchedule(id, schedule);
    if (!result.success) {
      throw new HttpError(400, result.error);
    }
    return result.data;
  }

  @Delete("/schedules/delete/:id")
  async deleteScheduleById(@Param('id') id: number) {
    return await scheduleRepository.delete(id);
  }
}