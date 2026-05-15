import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import { Booking } from 'src/bookings/entities/booking.entity';
import { BusSchedule } from 'src/busschedules/entities/busschedule.entity';
import { Bus } from 'src/buses/entities/bus.entity';
import { CanselTicketDto } from './dto/cansel-ticket.dto';
import { SeatReservation } from 'src/seat-reservations/entities/seat-reservation.entity';
import { LessThan } from 'typeorm';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(BusSchedule)
    private busScheduleRepository: Repository<BusSchedule>,
    @InjectRepository(Bus)
    private busRepository: Repository<Bus>,
    @InjectRepository(SeatReservation)
    private reservationRepository: Repository<SeatReservation>,
  ) {}
  async create(createTicketDto: CreateTicketDto) {
    const booking = await this.bookingRepository.findOneBy({
      id: createTicketDto.booking_id,
    });

    if (!booking) return null;

    const busSchedule = await this.busScheduleRepository.findOneBy({
      id: booking.bus_schedule_id,
    });

    if (!busSchedule) return null;

    const bus: Bus | null = await this.busRepository.findOneBy({
      id: busSchedule.bus_id,
    });

    if (!bus || !bus.capacity || bus.capacity.length === 0) {
      throw new Error('No available seats');
    }
    const sortedCapacity = [...bus.capacity].sort((a, b) => a - b);

    createTicketDto.seat_number = sortedCapacity[0];

    const Ticket = this.ticketRepository.create(createTicketDto);

    const updatedCapacity = sortedCapacity.slice(1);

    if (updatedCapacity.length === 0) {
      await this.busRepository.update(bus.id, {
        capacity: [],
      });
    } else {
      await this.busRepository.update(bus.id, {
        capacity: updatedCapacity,
      });
    }
    return await this.ticketRepository.save(Ticket);
  }

  findAll() {
    return this.ticketRepository.find();
  }

  findOne(id: number) {
    return this.ticketRepository.findOneBy({ id });
  }

  async findByBookingId(booking_id: number): Promise<Ticket[] | null> {
    return await this.ticketRepository.findBy({ booking_id });
  }

  async update(id: number, updateTicketDto: UpdateTicketDto) {
    const ticket = await this.ticketRepository.findOneBy({ id });
    if (!ticket) return null;

    if (updateTicketDto.is_child) updateTicketDto.price = 0;

    await this.ticketRepository.update(id, updateTicketDto);
    return await this.ticketRepository.findOneBy({ id });
  }

  async cansel(id: number, canselTicketDto: CanselTicketDto) {
    const booking = await this.bookingRepository.findOneBy({
      id: canselTicketDto.booking_id,
    });

    if (!booking) return null;

    const busSchedule = await this.busScheduleRepository.findOneBy({
      id: booking.bus_schedule_id,
    });

    if (!busSchedule) return null;

    const bus = await this.busRepository.findOneBy({ id: busSchedule.bus_id });

    if (!bus) return null;

    // Get current capacity
    const currentCapacity = [...bus.capacity];

    //TODO Разобраться с as number по хорошему))
    let insertIndex = 0;
    while (
      insertIndex < currentCapacity.length &&
      currentCapacity[insertIndex] < (canselTicketDto.seat_number as number)
    ) {
      insertIndex++;
    }

    // Insert the cancelled seat number at the correct position
    const updatedCapacity: number[] = [
      ...currentCapacity.slice(0, insertIndex),
      canselTicketDto.seat_number,
      ...currentCapacity.slice(insertIndex),
    ] as number[];

    await this.busRepository.update(bus.id, {
      capacity: updatedCapacity,
    });

    await this.ticketRepository.delete(id);
    return await this.ticketRepository.findOneBy({ id });
  }

  remove(id: number) {
    return `This action removes a #${id} ticket`;
  }
}
