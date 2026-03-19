import { PartialType } from '@nestjs/mapped-types';
import { CreateBusscheduleDto } from './create-busschedule.dto';

export class UpdateBusscheduleDto extends PartialType(CreateBusscheduleDto) {}
