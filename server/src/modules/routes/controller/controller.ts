import 'reflect-metadata';
import { Controller, Param, Body, Get, Post, Put, Delete, Patch } from 'routing-controllers';
import { Route } from "../entity/Route";
import { routeRepository } from '../repository/repository';

@Controller()
export class RouteController {
  @Get("/routes/")
  async getAll() {
    return await routeRepository.findAll();
  }

  @Get("/routes/:id")
  async getRouteById(@Param('id') id: number) {
    return await routeRepository.findOneById(id);
  }

  @Post("/routes/create/")
  async createRoute(@Body() route: Route) {
    return await routeRepository.create(route);
  }

  @Patch("/routes/update/:id")
  async updateRouteById(@Param('id') id: number, @Body() route: Route) {
    return await routeRepository.update(id, route);
  }

  @Delete("/routes/delete/:id")
  async deleteRouteById(@Param('id') id: number) {
    return await routeRepository.delete(id);
  }
}