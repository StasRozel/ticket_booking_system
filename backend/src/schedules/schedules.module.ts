import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { BusSchedule } from 'src/busschedules/entities/busschedule.entity';
import { Route } from 'src/routes/entities/route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, Route, BusSchedule])],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}
