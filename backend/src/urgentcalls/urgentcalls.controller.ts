import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UrgentcallsService } from './urgentcalls.service';
import { CreateUrgentcallDto } from './dto/create-urgentcall.dto';
import { UpdateUrgentcallDto } from './dto/update-urgentcall.dto';

@Controller('urgentcalls')
export class UrgentcallsController {
  constructor(private readonly urgentcallsService: UrgentcallsService) {}

  @Post()
  create(@Body() createUrgentcallDto: CreateUrgentcallDto) {
    return this.urgentcallsService.create(createUrgentcallDto);
  }

  @Get()
  findAll() {
    return this.urgentcallsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.urgentcallsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUrgentcallDto: UpdateUrgentcallDto,
  ) {
    return this.urgentcallsService.update(+id, updateUrgentcallDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.urgentcallsService.remove(+id);
  }
}
