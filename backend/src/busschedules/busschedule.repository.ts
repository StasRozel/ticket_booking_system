import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BusSchedule } from './entities/busschedule.entity';

@Injectable()
export class BusScheduleRepository extends Repository<BusSchedule> {
  async replaceDriverAndBus(
    id: number,
    bus_id?: number,
  ): Promise<BusSchedule | null> {
    const busSchedule = await this.findOneBy({ id });
    if (!busSchedule) return null;

    const updateData: Partial<BusSchedule> = { bus_id };
    //if (typeof bus_id !== 'undefined') updateData.bus_id = bus_id;

    //if (Object.keys(updateData).length === 0) return busSchedule;

    await this.update(id, updateData);
    return await this.findOneBy({ id });
  }
}
