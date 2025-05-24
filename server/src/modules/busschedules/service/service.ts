import { busScheduleRepository } from '../repository/repository';
import { BusSchedule } from '../entities/BusSchedule';
import { Schedule } from '../../schedules/entities/Schedule';
import { Bus } from '../../buses/entities/Bus';
import { AppDataSource } from '../../../config/db.config';

export class BusScheduleService {
  private scheduleRepository = AppDataSource.getRepository(Schedule);
  private busRepository = AppDataSource.getRepository(Bus);

  async validateBusScheduleData(data: Partial<BusSchedule>): Promise<{ isValid: boolean; error?: string }> {
    if (!data.schedule_id) {
      return { isValid: false, error: 'ID расписания обязательно' };
    }

    if (!data.bus_id) {
      return { isValid: false, error: 'ID автобуса обязательно' };
    }

    // Проверка существования расписания
    const schedule = await this.scheduleRepository.findOneBy({ id: data.schedule_id });
    if (!schedule) {
      return { isValid: false, error: `Расписание с ID ${data.schedule_id} не существует` };
    }

    // Проверка существования автобуса
    const bus = await this.busRepository.findOneBy({ id: data.bus_id });
    if (!bus) {
      return { isValid: false, error: `Автобус с ID ${data.bus_id} не существует` };
    }

    // Проверка доступности автобуса
    if (!bus.available) {
      return { isValid: false, error: `Автобус с ID ${data.bus_id} недоступен` };
    }

    return { isValid: true };
  }

  async createBusSchedule(data: Partial<BusSchedule>): Promise<{ success: boolean; data?: BusSchedule; error?: string }> {
    const validation = await this.validateBusScheduleData(data);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    try {
      const busSchedule = await busScheduleRepository.create(data);
      return { success: true, data: busSchedule };
    } catch (error) {
      return { success: false, error: 'Ошибка при создании расписания автобуса' };
    }
  }

  async updateBusSchedule(id: number, data: Partial<BusSchedule>): Promise<{ success: boolean; data?: BusSchedule; error?: string }> {
    const validation = await this.validateBusScheduleData(data);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    try {
      const busSchedule = await busScheduleRepository.update(id, data);
      if (!busSchedule) {
        return { success: false, error: 'Расписание автобуса не найдено' };
      }
      return { success: true, data: busSchedule };
    } catch (error) {
      return { success: false, error: 'Ошибка при обновлении расписания автобуса' };
    }
  }
}

export const busScheduleService = new BusScheduleService(); 