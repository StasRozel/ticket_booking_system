import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BusschedulesService } from './busschedules.service';
import { CreateBusscheduleDto } from './dto/create-busschedule.dto';
import { UpdateBusscheduleDto } from './dto/update-busschedule.dto';

@Controller('bus-schedules')
export class BusschedulesController {
  constructor(private readonly busschedulesService: BusschedulesService) {}

  @Post()
  create(@Body() createBusscheduleDto: CreateBusscheduleDto) {
    return this.busschedulesService.create(createBusscheduleDto);
  }

  @Get()
  findAll() {
    return this.busschedulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.busschedulesService.findOne(+id);
  }

  @Get('/date/:date')
  findByDate(@Param('date') date: string) {
    return this.busschedulesService.findByDate(date);
  }

  @Get('/bus/:id')
  async getBusByBusId(@Param('id') id: number) {
    return await this.busschedulesService.findOneByBusId(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBusscheduleDto: UpdateBusscheduleDto,
  ) {
    const numericId = +id;
    if (isNaN(numericId)) {
      return { success: false, error: 'Invalid id' };
    }
    return this.busschedulesService.update(numericId, updateBusscheduleDto);
  }

  @Patch('/:id/visit-stop')
  async visitStop(@Param('id') id: number, @Body() body: { stopId: number }) {
    return await this.busschedulesService.addVisitedStop(id, body.stopId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.busschedulesService.remove(+id);
  }
}
