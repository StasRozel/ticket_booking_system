import { urgentCallRepository } from '../repository/repository';
import { AppDataSource } from '../../../config/db.config';
import { BusSchedule } from '../../busschedules/entities/BusSchedule';

export class UrgentCallService {
  private busScheduleRepo = AppDataSource.getRepository(BusSchedule);

  async createUrgentCall(data: Partial<any>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Normalize payload keys: accept snake_case or camelCase
      const normalized: any = {
        busScheduleId: data?.bus_schedule_id ?? data?.busScheduleId,
        driverId: data?.driver_id ?? data?.driverId,
        latitude: data?.latitude ?? null,
        longitude: data?.longitude ?? null,
        accepted: data?.accepted ?? false,
      };

      // Basic validation
      if (!normalized.busScheduleId) {
        return { success: false, error: 'bus_schedule_id is required' };
      }
      if (!normalized.driverId) {
        return { success: false, error: 'driver_id is required' };
      }

      const busSchedule = await this.busScheduleRepo.findOneBy({ id: normalized.busScheduleId });
      if (!busSchedule) return { success: false, error: `BusSchedule ${normalized.busScheduleId} not found` };

      // Create using repository with normalized property names matching entity fields
      const created = await urgentCallRepository.create(normalized);
      return { success: true, data: created };
    } catch (error) {
      console.error('Error creating urgent call:', error);
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: `Failed to create urgent call: ${message}` };
    }
  }
}

export const urgentCallService = new UrgentCallService();
