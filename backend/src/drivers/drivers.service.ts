import { Injectable } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { BusSchedule } from '../busschedules/entities/busschedule.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(BusSchedule)
    private busScheduleRepository: Repository<BusSchedule>,
  ) {}
  async create(createDriverDto: CreateDriverDto) {
    const driver = this.driverRepository.create(createDriverDto);
    return await this.driverRepository.save(driver);
  }

  findAll() {
    return this.driverRepository.find({ relations: ['user'] });
  }

  findOne(id: number) {
    return this.driverRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  findOneByUserId(user_id: number) {
    return this.driverRepository.findOneBy({ user_id });
  }

  async update(id: number, updateDriverDto: UpdateDriverDto) {
    const driver = await this.driverRepository.findOneBy({ id });

    if (!driver) return null;

    const oldBusId = driver.bus_id;
    await this.driverRepository.update(id, updateDriverDto);

    if (updateDriverDto.bus_id && updateDriverDto.bus_id !== oldBusId) {
      await this.busScheduleRepository.update(
        { bus_id: oldBusId },
        { bus_id: updateDriverDto.bus_id },
      );
    }

    return await this.driverRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const result = await this.driverRepository.delete(id);

    return result.affected !== 0;
  }
}
