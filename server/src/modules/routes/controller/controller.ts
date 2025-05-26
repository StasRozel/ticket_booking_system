import 'reflect-metadata';
import { Controller, Param, Body, Get, Post, Put, Delete, Patch, Res, NotFoundError } from 'routing-controllers';
import { Route } from "../entities/Route";
import { routeRepository } from '../repository/repository';
import { scheduleRepository } from '../../schedules/repository/repository';

@Controller()
export class RouteController {
  @Get("/api/routes/")
  async getAll() {
    return await routeRepository.findAll();
  }

  @Get("/api/routes/:id")
  async getRouteById(@Param('id') id: number) {
    return await routeRepository.findOneById(id);
  }

  @Get("/api/price/:id")
  async getPriceById(@Param('id') id: number) {
    return await routeRepository.findPriceById(id);
  }

  @Post("/api/routes/create/")
  async createRoute(@Body() route: Route) {
    return await routeRepository.create(route);
  }

  @Patch("/api/routes/update/:id")
  async updateRouteById(@Param('id') id: number, @Body() route: Route) {
    return await routeRepository.update(id, route);
  }

  @Delete("/api/routes/delete/:id")
  async deleteRouteById(@Param('id') id: number) {
    return await routeRepository.delete(id);
  }
}

