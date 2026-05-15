import { PartialType } from '@nestjs/mapped-types';
import { CreateSeatReservationDto } from './create-seat-reservation.dto';

export class UpdateSeatReservationDto extends PartialType(CreateSeatReservationDto) {}