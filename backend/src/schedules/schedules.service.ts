import { Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { Route } from 'src/routes/entities/route.entity';
import { BusSchedule } from 'src/busschedules/entities/busschedule.entity';
import { ResponseType } from 'src/share/types/ResponseType';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(BusSchedule)
    private busScheduleRepository: Repository<BusSchedule>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<ResponseType> {
    const validation = await this.validateScheduleData(createScheduleDto);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    try {
      const schedule = this.scheduleRepository.create(createScheduleDto);
      return { success: true, data: schedule };
    } catch (error) {
      return {
        success: false,
        message: 'Ошибка при создании расписания',
        error: error,
      };
    }
  }
  async findAll() {
    return await this.scheduleRepository.find({ relations: ['route'] });
  }

  async findOne(id: number) {
    return await this.scheduleRepository.findOne({ where: { id }, relations: ['route'] });
  }

  async validateScheduleData(
    data: Partial<Schedule>,
  ): Promise<{ isValid: boolean; error?: string }> {
    if (data.route_id) {
      const route = await this.routeRepository.findOneBy({ id: data.route_id });
      if (!route) {
        return {
          isValid: false,
          error: `Маршрут с ID ${data.route_id} не существует`,
        };
      }
    }

    if (data.busSchedules) {
      for (const busSchedule of data.busSchedules) {
        const existingBusSchedule = await this.busScheduleRepository.findOneBy({
          id: busSchedule.id,
        });
        if (!existingBusSchedule) {
          return {
            isValid: false,
            error: `Расписание автобуса с ID ${busSchedule.id} не существует`,
          };
        }
      }
    }

    return { isValid: true };
  }

  async update(
    id: number,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<ResponseType> {
    const validation = await this.validateScheduleData(updateScheduleDto);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    try {
      await this.scheduleRepository.update(id, updateScheduleDto);

      const schedule = await this.findOne(id);

      if (!schedule) {
        return { success: false, message: 'Расписание не найдено' };
      }
      return { success: true, data: schedule };
    } catch (error) {
      return {
        success: false,
        message: 'Ошибка при обновлении расписания',
        error: error,
      };
    }
  }

  async remove(id: number) {
    const result = await this.scheduleRepository.delete(id);
    return result.affected !== 0;
  }

  async deleteByRouteId(route_id: number) {
    const result = await this.scheduleRepository.delete({
      route: { id: route_id },
    });
    return result.affected !== 0;
  }
}
