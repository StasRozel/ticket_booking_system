import { Injectable } from '@nestjs/common';
import { CreateBusscheduleDto } from './dto/create-busschedule.dto';
import { UpdateBusscheduleDto } from './dto/update-busschedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BusSchedule } from './entities/busschedule.entity';
import { Repository } from 'typeorm';
import { Bus } from 'src/buses/entities/bus.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { BusScheduleRepository } from './busschedule.repository';
import { Urgentcall } from 'src/urgentcalls/entities/urgentcall.entity';

@Injectable()
export class BusschedulesService {
  constructor(
    @InjectRepository(BusSchedule)
    private busScheduleRepository: BusScheduleRepository,
    @InjectRepository(Bus)
    private busRepository: Repository<Bus>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Urgentcall)
    private urgentCallRepository: Repository<Urgentcall>,
  ) {}
  async create(createBusscheduleDto: CreateBusscheduleDto) {
    const validation = await this.validateBusScheduleData(createBusscheduleDto);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const busSchedule = this.busScheduleRepository.create(createBusscheduleDto);
    return await this.busScheduleRepository.save(busSchedule);
  }

  findAll() {
    return this.busScheduleRepository
      .createQueryBuilder('busSchedule')
      .leftJoinAndSelect('busSchedule.schedule', 'schedule')
      .leftJoinAndSelect('schedule.route', 'route')
      .leftJoinAndSelect('busSchedule.bus', 'bus')
      .where('bus.capacity != :capacity', { capacity: {} })
      .getMany();
  }

  findOne(id: number) {
    return this.busScheduleRepository
      .createQueryBuilder('busSchedule')
      .leftJoinAndSelect('busSchedule.schedule', 'schedule')
      .leftJoinAndSelect('schedule.route', 'route')
      .leftJoinAndSelect('busSchedule.bus', 'bus')
      .where({ id: id })
      .getOne();
  }

  async findOneByBusId(bus_id: number): Promise<BusSchedule[] | null> {
    const busSchedules = await this.busScheduleRepository.findBy({ bus_id });

    return busSchedules;
  }

  async update(id: number, updateBusscheduleDto: UpdateBusscheduleDto) {
    const busSchedule = await this.busScheduleRepository.findOneBy({ id });

    if (!busSchedule) return null;

    const validation = await this.validateBusScheduleData(updateBusscheduleDto);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    await this.busScheduleRepository.update(id, updateBusscheduleDto);
    return await this.busScheduleRepository.findOneBy({ id });
  }

  async addVisitedStop(
    id: number,
    stopId: number,
  ): Promise<BusSchedule | null> {
    const busSchedule = await this.busScheduleRepository.findOneBy({ id });
    if (!busSchedule) return null;

    const visited = busSchedule.visited_stops || [];
    if (!visited.includes(stopId)) {
      visited.push(stopId);
      await this.busScheduleRepository.update(id, { visited_stops: visited });
    }
    return await this.busScheduleRepository.findOneBy({ id });
  }

  async validateBusScheduleData(
    data: Partial<BusSchedule>,
  ): Promise<{ isValid: boolean; error?: string }> {
    if (!data.schedule_id) {
      return { isValid: false, error: 'ID расписания обязательно' };
    }

    if (!data.bus_id) {
      return { isValid: false, error: 'ID автобуса обязательно' };
    }

    // Проверка существования расписания
    const schedule = await this.scheduleRepository.findOneBy({
      id: data.schedule_id,
    });
    if (!schedule) {
      return {
        isValid: false,
        error: `Расписание с ID ${data.schedule_id} не существует`,
      };
    }

    // Проверка существования автобуса
    const bus = await this.busRepository.findOneBy({ id: data.bus_id });
    if (!bus) {
      return {
        isValid: false,
        error: `Автобус с ID ${data.bus_id} не существует`,
      };
    }

    // Проверка доступности автобуса
    if (!bus.available) {
      return {
        isValid: false,
        error: `Автобус с ID ${data.bus_id} недоступен`,
      };
    }

    return { isValid: true };
  }

  async replaceDriverAndBus(
    id: number,
    driver_id?: number,
    unrgent_call_id?: number,
  ): Promise<{ success: boolean; busSchedule?: BusSchedule; error?: string }> {
    try {
      if (!driver_id || !unrgent_call_id) {
        return {
          success: false,
        };
      }

      const driver = await this.driverRepository.findOneBy({ id: driver_id });

      if (!driver) {
        return {
          success: false,
          error: `Водитель с ID ${driver_id} не найден`,
        };
      }

      const updated = await this.busScheduleRepository.replaceDriverAndBus(
        id,
        driver.bus_id,
      );

      if (!updated) {
        return {
          success: false,
          error: 'Не удалось заменить водителя/автобус у расписания',
        };
      }

      await this.urgentCallRepository.update(unrgent_call_id, {
        driverId: driver_id,
        accepted: true,
      });

      return { success: true, busSchedule: updated };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Ошибка при замене водителя/автобуса',
      };
    }
  }

  async remove(id: number) {
    const busSchedule = await this.busScheduleRepository.delete(id);
    return busSchedule.affected !== 0;
  }
}
