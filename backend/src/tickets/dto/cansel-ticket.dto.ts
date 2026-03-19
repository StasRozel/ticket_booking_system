import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';

export class CanselTicketDto extends PartialType(CreateTicketDto) {}
