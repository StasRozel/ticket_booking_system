import { Module } from '@nestjs/common';
import { BusschedulesService } from './busschedules.service';
import { BusschedulesController } from './busschedules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusSchedule } from './entities/busschedule.entity';
import { Bus } from 'src/buses/entities/bus.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Urgentcall } from 'src/urgentcalls/entities/urgentcall.entity';
import { BusScheduleRepository } from './busschedule.repository';
import { SeatReservation } from 'src/seat-reservations/entities/seat-reservation.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Booking } from 'src/bookings/entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusSchedule,
      Bus,
      Schedule,
      Driver,
      Urgentcall,
      SeatReservation,
      Ticket,
      Booking,
    ]),
  ],
  controllers: [BusschedulesController],
  providers: [BusschedulesService, BusScheduleRepository],
  exports: [BusschedulesService],
})
export class BusschedulesModule {}
