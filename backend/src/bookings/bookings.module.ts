import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { SeatReservation } from 'src/seat-reservations/entities/seat-reservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, SeatReservation])],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}