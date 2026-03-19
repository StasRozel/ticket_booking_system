import { Injectable } from '@nestjs/common';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bus } from './entities/bus.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BusesService {
  constructor(
    @InjectRepository(Bus)
    private busRepository: Repository<Bus>,
  ) {}
  async create(createBusDto: CreateBusDto) {
    const totalCapacity = Number(createBusDto.capacity[0]);
    createBusDto.capacity = Array.from(
      { length: totalCapacity },
      (_, i) => i + 1,
    );

    const bus = this.busRepository.create(createBusDto);
    return await this.busRepository.save(bus);
  }

  findAll() {
    return this.busRepository.find();
  }

  findOne(id: number) {
    return this.busRepository.findOneBy({ id });
  }

  async update(id: number, updateBusDto: UpdateBusDto) {
    const bus = await this.busRepository.findOneBy({ id });
    if (!bus) {
      return null;
    }

    if (
      Array.isArray(updateBusDto.capacity) &&
      updateBusDto.capacity[1] == -1
    ) {
      const totalCapacity = Number(updateBusDto.capacity[0]);
      console.log(updateBusDto.capacity);
      updateBusDto.capacity = Array.from(
        { length: totalCapacity },
        (_, i) => i + 1,
      );
    }

    await this.busRepository.update(id, updateBusDto);
    return await this.busRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const result = await this.busRepository.delete(id);
    return result.affected !== 0;
  }
}
