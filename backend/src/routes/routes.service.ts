import { Injectable } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}
  async create(createRouteDto: CreateRouteDto) {
    const route = this.routeRepository.create(createRouteDto);
    return await this.routeRepository.save(route);
  }

  findAll() {
    return this.routeRepository.find();
  }

  findOne(id: number) {
    return this.routeRepository.findOneBy({ id });
  }

  async update(id: number, updateRouteDto: UpdateRouteDto) {
    const route = await this.routeRepository.findOneBy({ id });

    if (!route) return null;

    await this.routeRepository.update(id, updateRouteDto);

    return await this.routeRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const result = await this.routeRepository.delete(id);
    return result.affected !== 0;
  }
}
