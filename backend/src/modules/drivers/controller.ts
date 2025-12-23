import 'reflect-metadata';
import { Controller, Param, Body, Get, Post, Delete, Patch } from 'routing-controllers';
import { driverRepository } from './repository';
import { Driver } from './entities/driver';

@Controller("/api/drivers")
export class DriverController {
  @Get("/")
  async getAll() {
    return await driverRepository.findAll();
  }

  @Get("/:id")
  async getDriverById(@Param('id') id: number) {
    return await driverRepository.findOneById(id);
  }

  @Get("/user/:id")
  async getDriverByUserId(@Param('id') id: number) {
    return await driverRepository.findOneByUserId(id);
  }

  @Post("/create/")
  async createDriver(@Body() route: Partial<Driver>) {
    return await driverRepository.create(route);
  }

  @Patch("/update/:id")
  async updateDriverById(@Param('id') id: number, @Body() route: Partial<Driver>) {
    return await driverRepository.update(id, route);
  }

  @Delete("/delete/:id")
  async deleteDriverById(@Param('id') id: number) {
    return await driverRepository.delete(id);
  }
}