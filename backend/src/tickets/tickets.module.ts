import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bus } from 'src/buses/entities/bus.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { BusSchedule } from 'src/busschedules/entities/busschedule.entity';
import { BusScheduleRepository } from 'src/busschedules/busschedule.repository';
import { SeatReservation } from 'src/seat-reservations/entities/seat-reservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Booking, Bus, BusSchedule, SeatReservation])],
  controllers: [TicketsController],
  providers: [TicketsService, BusScheduleRepository],
})
export class TicketsModule {}
