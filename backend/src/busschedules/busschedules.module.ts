import { Module } from '@nestjs/common';
import { BusschedulesService } from './busschedules.service';
import { BusschedulesController } from './busschedules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusSchedule } from './entities/busschedule.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Urgentcall } from 'src/urgentcalls/entities/urgentcall.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { BusScheduleRepository } from './busschedule.repository';
import { Bus } from 'src/buses/entities/bus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusSchedule, Bus, Driver, Urgentcall, Schedule]),
  ],
  controllers: [BusschedulesController],
  providers: [BusschedulesService, BusScheduleRepository],
  exports: [BusschedulesService],
})
export class BusschedulesModule {}
