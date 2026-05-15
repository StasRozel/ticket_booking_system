import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { SeatReservationsService } from './seat-reservations.service';
import { CreateSeatReservationDto } from './dto/create-seat-reservation.dto';

@Controller('seat-reservations')
export class SeatReservationsController {
  constructor(
    private readonly seatReservationsService: SeatReservationsService,
  ) {}

  @Get('/bus-schedule/:id')
  getSeatMap(@Param('id') id: string) {
    return this.seatReservationsService.getSeatMap(+id);
  }

  @Get('/user/:userId')
  getUserReservations(
    @Param('userId') userId: string,
    @Query('busScheduleId') busScheduleId?: string,
  ) {
    return this.seatReservationsService.getUserReservations(
      +userId,
      busScheduleId ? +busScheduleId : undefined,
    );
  }

  @Post('/reserve')
  reserve(@Body() createDto: CreateSeatReservationDto) {
    return this.seatReservationsService.reserve(createDto);
  }

  @Delete('/:id')
  cancelReservation(
    @Param('id') id: string,
    @Body() body: { user_id: number },
  ) {
    return this.seatReservationsService.cancelReservation(+id, body.user_id);
  }

  @Delete('/cancel-all/:busScheduleId')
  cancelAllReservations(
    @Param('busScheduleId') busScheduleId: string,
    @Body() body: { user_id: number },
  ) {
    return this.seatReservationsService.cancelAllReservations(
      body.user_id,
      +busScheduleId,
    );
  }

  @Post('/confirm')
  confirmReservations(
    @Body()
    body: {
      user_id: number;
      bus_schedule_id: number;
      boarding_point: string;
    },
  ) {
    return this.seatReservationsService.confirmReservations(
      body.user_id,
      body.bus_schedule_id,
      body.boarding_point,
    );
  }
}
