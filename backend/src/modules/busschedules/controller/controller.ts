import 'reflect-metadata';
import { Controller, Param, Body, Get, Post, Put, Delete, Patch, HttpError } from 'routing-controllers';
import { busScheduleRepository } from '../repository/repository';
import { BusSchedule } from '../entities/BusSchedule';
import { busScheduleService } from '../service/service';

@Controller("/api/bus-schedules")
export class BusScheduleController {
  @Get("/")
  async getAll() {
    return await busScheduleRepository.findAll();
  }

  @Get("/:id")
  async getBusById(@Param('id') id: number) {
    return await busScheduleRepository.findOneById(id);
  }

  @Get("/bus/:id")
  async getBusByBusId(@Param('id') id: number) {
    return await busScheduleRepository.findOneByBusId(id);
  }


  @Post("/create/")
  async createBus(@Body() busSchedule: BusSchedule) {
    const result = await busScheduleService.createBusSchedule(busSchedule);
    if (!result.success) {
      throw new HttpError(400, result.error);
    }
    return result.data;
  }

  @Patch("/update/:id")
  async updateBusById(@Param('id') id: number, @Body() busSchedule: BusSchedule) {
    try {
      const result = await busScheduleService.updateBusSchedule(id, busSchedule);
      if (!result.success) {
        throw new HttpError(400, result.error || 'Не удалось обновить расписание');
      }
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Внутренняя ошибка сервера при обновлении расписания');
    }
  }

  @Patch("/:id/visit-stop")
  async visitStop(@Param('id') id: number, @Body() body: { stopId: number }) {
    return await busScheduleRepository.addVisitedStop(id, body.stopId);
  }

  @Patch("/replace/:id")
  async replaceDriverAndBus(@Param('id') id: number, @Body() body: { driver_id: number, urgent_call_id: number }) {
    try {
      const result = await busScheduleService.replaceDriverAndBus(id, body.driver_id, body.urgent_call_id);
      if (!result.success) {
        throw new HttpError(400, result.error);
      }
      return { success: true, data: result.data };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, 'Внутренняя ошибка при замене водителя/автобуса');
    }
  }

  @Delete("/delete/:id")
  async deleteBusById(@Param('id') id: number) {
    return await busScheduleRepository.delete(id);
  }
}