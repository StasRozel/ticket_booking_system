import { Module } from '@nestjs/common';
import { UrgentcallsService } from './urgentcalls.service';
import { UrgentcallsController } from './urgentcalls.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Urgentcall } from './entities/urgentcall.entity';
import { BusSchedule } from 'src/busschedules/entities/busschedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Urgentcall, BusSchedule])],
  controllers: [UrgentcallsController],
  providers: [UrgentcallsService],
})
export class UrgentcallsModule {}
