import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  findAll(): Promise<Booking[]> {
    return this.bookingRepository.find();
  }

  async findAllByUserId(user_id: number): Promise<Booking[]> {
    const booking = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.busSchedule', 'bus_schedule')
      .leftJoinAndSelect('bus_schedule.schedule', 'schedule')
      .leftJoinAndSelect('schedule.route', 'route')
      .leftJoinAndSelect('bus_schedule.bus', 'bus')
      .where({ user_id })
      .getMany();
    return booking;
  }

  findOne(id: number) {
    return this.bookingRepository.findOneBy({ id });
  }

  async create(createBookingDto: CreateBookingDto): Promise<Booking | null> {
    console.log(createBookingDto);

    const id = await this.checkByIsSelect(
      createBookingDto.user_id,
      createBookingDto.bus_schedule_id,
    );

    if (id) return await this.bookingRepository.findOneBy({ id });

    const booking = this.bookingRepository.create(createBookingDto);

    return this.bookingRepository.save(booking);
  }

  async checkByIsSelect(
    user_id: number,
    bus_schedule_id: number,
  ): Promise<number> {
    const booking: Booking[] = await this.bookingRepository.findBy({
      user_id,
      bus_schedule_id,
      status: 'Выбран',
    });
    return booking[0]?.id ?? 0;
  }

  async update(
    id: number,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking | null> {
    const booking = await this.bookingRepository.findOneBy({ id });

    if (!booking) return null;

    await this.bookingRepository.update(id, updateBookingDto);

    return await this.bookingRepository.findOneBy({ id });
  }

  async findAllByBusScheduleId(bus_schedule_id: number): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { bus_schedule_id },
      relations: ['user', 'tickets'],
    });
  }

  async getBookingByScheduleId(id: number) {
    const bookings = await this.findAllByBusScheduleId(id);

    // sanitize user and include tickets only for this booking
    return bookings.map((b) => {
      const user = { ...b.user } as any;
      if (user) {
        delete user.password;
        delete user.refresh_token;
      }
      const allTickets = (b as any).tickets || [];
      const tickets = allTickets
        .filter((t: any) => t.booking_id === b.id)
        .map((t: any) => ({ id: t.id, seat_number: t.seat_number }));
      return {
        id: b.id,
        bus_schedule_id: b.bus_schedule_id,
        user_id: b.user_id,
        booking_date: b.booking_date,
        status: b.status,
        user,
        tickets,
      };
    });
  }

  // TODO наверное я лучше не буду использовать этот метод так как нужно будет менять логику бронирвания места
  // async cansel(id: number, data: Partial<Booking>) {
  //   const tickets = await ticketRepository.findByBookingId(id);
  //   const booking = await bookingRepository.findOneById(id);
  //   const busSchedule = await busScheduleRepository.findOneById(
  //     booking.bus_schedule_id,
  //   );
  //   const bus = await busRepository.findOneById(busSchedule.bus_id);
  //   const seats = new Set(bus.capacity);
  //   tickets.forEach((ticket) => {
  //     seats.add(ticket.seat_number);
  //   });
  //   await busRepository.update(bus.id, { capacity: [...seats] });
  //   await this.bookingRepository.update(id, data);
  //   return await this.bookingRepository.findOneBy({ id });
  // }

  async remove(id: number): Promise<boolean> {
    const result = await this.bookingRepository.delete(id);
    return result.affected !== 0;
  }

  async updateStatusByUserId(user_id: number, status: string): Promise<void> {
    await this.bookingRepository.update({ user_id }, { status });
  }

  async completeByScheduleId(bus_schedule_id: number): Promise<void> {
    await this.bookingRepository.update(
      { bus_schedule_id },
      { status: 'Завершен' },
    );
  }
}
