import { Injectable } from '@nestjs/common';
import { CreateUrgentcallDto } from './dto/create-urgentcall.dto';
import { UpdateUrgentcallDto } from './dto/update-urgentcall.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Urgentcall } from './entities/urgentcall.entity';
import { Repository } from 'typeorm';
import { BusSchedule } from 'src/busschedules/entities/busschedule.entity';
import { ResponseType } from 'src/share/types/ResponseType';

@Injectable()
export class UrgentcallsService {
  constructor(
    @InjectRepository(Urgentcall)
    private urgentCallRepository: Repository<Urgentcall>,
    @InjectRepository(BusSchedule)
    private busScheduleRepository: Repository<BusSchedule>,
  ) {}

  async create(
    createUrgentcallDto: CreateUrgentcallDto,
  ): Promise<ResponseType> {
    try {
      if (!createUrgentcallDto.busScheduleId) {
        return { success: false, message: 'busScheduleId is required' };
      }
      if (!createUrgentcallDto.driverId) {
        return { success: false, message: 'driverId is required' };
      }

      const busSchedule = await this.busScheduleRepository.findOneBy({
        id: createUrgentcallDto.busScheduleId,
      });
      if (!busSchedule)
        return {
          success: false,
          error: `BusSchedule ${createUrgentcallDto.busScheduleId} not found`,
        };
      console.log(createUrgentcallDto);
      const created = this.urgentCallRepository.create(createUrgentcallDto);
      await this.urgentCallRepository.save(created);
      return { success: true, data: created };
    } catch (error) {
      console.error('Error creating urgent call:', error);
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Failed to create urgent call: ${message}`,
      };
    }
  }

  async findAll() {
    return await this.urgentCallRepository.find();
  }

  async findOne(id: number) {
    return await this.urgentCallRepository.findOneBy({ id });
  }

  async update(id: number, updateUrgentcallDto: UpdateUrgentcallDto) {
    const urgentCall = await this.findOne(id);
    if (!urgentCall) {
      return null;
    }

    await this.urgentCallRepository.update(id, updateUrgentcallDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.urgentCallRepository.delete(id);
    return result.affected !== 0;
  }
}
