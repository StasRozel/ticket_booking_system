import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { SeatReservation } from 'src/seat-reservations/entities/seat-reservation.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(SeatReservation)
    private seatReservationRepository: Repository<SeatReservation>,
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

    if (
      updateBookingDto.status === 'Отменен' ||
      updateBookingDto.status === 'истек'
    ) {
      await this.seatReservationRepository.delete({
        user_id: booking.user_id,
        bus_schedule_id: booking.bus_schedule_id,
        status: 'reserved',
      });
    }

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
        boarding_point: b.boarding_point,
        user,
        tickets,
      };
    });
  }

  async remove(id: number): Promise<boolean> {
    const booking = await this.bookingRepository.findOneBy({ id });
    if (booking) {
      await this.seatReservationRepository.delete({
        user_id: booking.user_id,
        bus_schedule_id: booking.bus_schedule_id,
        status: 'reserved',
      });
    }
    const result = await this.bookingRepository.delete(id);
    return result.affected !== 0;
  }

  async updateStatusByUserId(user_id: number, status: string): Promise<void> {
    await this.bookingRepository.update({ user_id }, { status });
  }

  async completeByScheduleId(bus_schedule_id: number): Promise<void> {
    const bookings = await this.findAllByBusScheduleId(bus_schedule_id);

    for (const booking of bookings) {
      await this.bookingRepository.manager.increment(
        User,
        { id: booking.user_id },
        'count_trips',
        1,
      );
    }

    await this.bookingRepository.update(
      { bus_schedule_id },
      { status: 'Завершен' },
    );
  }
}