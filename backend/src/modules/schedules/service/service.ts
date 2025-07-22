import { scheduleRepository } from '../repository/repository';
import { Schedule } from '../entities/Schedule';
import { Route } from '../../routes/entities/Route';
import { AppDataSource } from '../../../config/db.config';
import { BusSchedule } from '../../busschedules/entities/BusSchedule';

export class ScheduleService {
  private routeRepository = AppDataSource.getRepository(Route);
  private busScheduleRepository = AppDataSource.getRepository(BusSchedule);

  async validateScheduleData(data: Partial<Schedule>): Promise<{ isValid: boolean; error?: string }> {
    // Проверка существования маршрута
    if (data.route_id) {
      const route = await this.routeRepository.findOneBy({ id: data.route_id });
      if (!route) {
        return { isValid: false, error: `Маршрут с ID ${data.route_id} не существует` };
      }
    }

    // Если есть связанные расписания автобусов, проверяем их существование
    if (data.busSchedules) {
      for (const busSchedule of data.busSchedules) {
        const existingBusSchedule = await this.busScheduleRepository.findOneBy({ id: busSchedule.id });
        if (!existingBusSchedule) {
          return { isValid: false, error: `Расписание автобуса с ID ${busSchedule.id} не существует` };
        }
      }
    }

    return { isValid: true };
  }

  async createSchedule(data: Partial<Schedule>): Promise<{ success: boolean; data?: Schedule; error?: string }> {
    const validation = await this.validateScheduleData(data);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    try {
      const schedule = await scheduleRepository.create(data);
      return { success: true, data: schedule };
    } catch (error) {
      return { success: false, error: 'Ошибка при создании расписания' };
    }
  }

  async updateSchedule(id: number, data: Partial<Schedule>): Promise<{ success: boolean; data?: Schedule; error?: string }> {
    const validation = await this.validateScheduleData(data);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    try {
      const schedule = await scheduleRepository.update(id, data);
      if (!schedule) {
        return { success: false, error: 'Расписание не найдено' };
      }
      return { success: true, data: schedule };
    } catch (error) {
      return { success: false, error: 'Ошибка при обновлении расписания' };
    }
  }
}

export const scheduleService = new ScheduleService(); 