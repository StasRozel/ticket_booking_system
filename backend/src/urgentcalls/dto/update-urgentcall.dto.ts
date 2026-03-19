import { PartialType } from '@nestjs/mapped-types';
import { CreateUrgentcallDto } from './create-urgentcall.dto';

export class UpdateUrgentcallDto extends PartialType(CreateUrgentcallDto) {}
