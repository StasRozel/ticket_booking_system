import { Injectable } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
  ) {}
  async create(createDriverDto: CreateDriverDto) {
    const driver = this.driverRepository.create(createDriverDto);
    return await this.driverRepository.save(driver);
  }

  findAll() {
    return this.driverRepository.find();
  }

  findOne(id: number) {
    return this.driverRepository.findOneBy({ id });
  }

  findOneByUserId(user_id: number) {
    return this.driverRepository.findOneBy({ user_id });
  }

  async update(id: number, updateDriverDto: UpdateDriverDto) {
    const driver = await this.driverRepository.findOneBy({ id });

    if (!driver) return null;

    await this.driverRepository.update(id, updateDriverDto);

    return await this.driverRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const result = await this.driverRepository.delete(id);

    return result.affected !== 0;
  }
}
