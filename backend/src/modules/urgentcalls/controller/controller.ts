import 'reflect-metadata';
import { Controller, Param, Body, Get, Post, Delete, Patch } from 'routing-controllers';
import { urgentCallRepository } from '../repository/repository';
import { UrgentCall } from '../entities/urgentCall';
import { urgentCallService } from '../service/service';

@Controller()
export class UrgentCallController {
  // Helper to serialize entity to snake_case format for frontend
  private serializeUrgentCall(call: UrgentCall) {
    return {
      id: call.id,
      bus_schedule_id: call.busScheduleId,
      driver_id: call.driverId,
      latitude: call.latitude,
      longitude: call.longitude,
      accepted: call.accepted,
    };
  }

  @Get("/api/urgentcalls/")
  async getAll() {
    const calls = await urgentCallRepository.findAll();
    return calls.map(c => this.serializeUrgentCall(c));
  }

  @Get("/api/urgentcalls/:id")
  async getUrgentCallById(@Param('id') id: number) {
    const call = await urgentCallRepository.findOneById(id);
    return call ? this.serializeUrgentCall(call) : null;
  }

  @Post("/api/urgentcalls/create/")
  async createUrgentCall(@Body() urgentCall: UrgentCall) {
    const result = await urgentCallService.createUrgentCall(urgentCall as any);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: this.serializeUrgentCall(result.data) };
  }

  @Patch("/api/urgentcalls/update/:id")
  async updateUrgentCallById(@Param('id') id: number, @Body() urgentCall: UrgentCall) {
    const updated = await urgentCallRepository.update(id, urgentCall);
    return updated ? this.serializeUrgentCall(updated) : null;
  }

  @Delete("/api/urgentcalls/delete/:id")
  async deleteUrgentCallById(@Param('id') id: number) {
    return await urgentCallRepository.delete(id);
  }
}

