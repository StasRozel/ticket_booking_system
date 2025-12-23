import 'reflect-metadata';
import { Controller, Param, Body, Get, Post, Delete, Patch } from 'routing-controllers';
import { driverComplaintRepository } from '../repository/repository';
import { DriverComplaint } from '../entities/driverComplaint';

@Controller("/api/drivers-complaints")
export class DriverComplaintsController {
  @Get("/")
  async getAll() {
    return await driverComplaintRepository.findAll();
  }

  @Get("/:id")
  async getDriverById(@Param('id') id: number) {
    return await driverComplaintRepository.findOneById(id);
  }

  @Get("/user/:id")
  async getDriverByUserId(@Param('id') id: number) {
    return await driverComplaintRepository.findOneByUserId(id);
  }

  @Post("/create/")
  async createDriver(@Body() route: Partial<DriverComplaint>) {
    return await driverComplaintRepository.create(route);
  }

  @Patch("/update/:id")
  async updateDriverById(@Param('id') id: number, @Body() route: Partial<DriverComplaint>) {
    return await driverComplaintRepository.update(id, route);
  }

  @Delete("/delete/:id")
  async deleteDriverById(@Param('id') id: number) {
    return await driverComplaintRepository.delete(id);
  }
}