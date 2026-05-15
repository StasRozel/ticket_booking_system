import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatReservation } from './entities/seat-reservation.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { BusSchedule } from '../busschedules/entities/busschedule.entity';
import { Bus } from '../buses/entities/bus.entity';
import { SeatReservationsService } from './seat-reservations.service';
import { SeatReservationsController } from './seat-reservations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SeatReservation,
      Booking,
      Ticket,
      BusSchedule,
      Bus,
    ]),
  ],
  controllers: [SeatReservationsController],
  providers: [SeatReservationsService],
  exports: [SeatReservationsService],
})
export class SeatReservationsModule {}
