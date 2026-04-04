import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { BusSchedule } from '../busschedules/entities/busschedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, BusSchedule])],
  controllers: [DriversController],
  providers: [DriversService],
})
export class DriversModule {}
