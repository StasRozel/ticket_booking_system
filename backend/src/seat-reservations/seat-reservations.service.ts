import { Injectable } from '@nestjs/common';
import { CreateSeatReservationDto } from './dto/create-seat-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { SeatReservation } from './entities/seat-reservation.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { BusSchedule } from '../busschedules/entities/busschedule.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SeatReservationsService {
  constructor(
    @InjectRepository(SeatReservation)
    private reservationRepository: Repository<SeatReservation>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(BusSchedule)
    private busScheduleRepository: Repository<BusSchedule>,
  ) {}

  async getSeatMap(busScheduleId: number) {
    const busSchedule = await this.busScheduleRepository.findOne({
      where: { id: busScheduleId },
      relations: ['schedule', 'schedule.route', 'bus'],
    });
    if (!busSchedule) return null;

    const bus = busSchedule.bus;
    const allSeats: number[] = bus?.capacity || [];

    const now = new Date();

    await this.reservationRepository.delete({
      status: 'reserved',
      expires_at: LessThan(now),
    });

    const takenTickets = await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.booking', 'booking')
      .where('booking.bus_schedule_id = :busScheduleId', { busScheduleId })
      .andWhere('booking.status NOT IN (:...statuses)', {
        statuses: ['Отменен', 'истек'],
      })
      .getMany();

    const takenSeatNumbers = takenTickets.map((t) => t.seat_number);

    const activeReservations = await this.reservationRepository.find({
      where: {
        bus_schedule_id: busScheduleId,
        status: 'reserved',
      },
    });

    const reservedSeatNumbers = activeReservations.map((r) => r.seat_number);

    const seatMap = allSeats.map((seatNum) => {
      const isOccupied = takenSeatNumbers.includes(seatNum);
      const reservation = activeReservations.find(
        (r) => r.seat_number === seatNum,
      );
      return {
        seat_number: seatNum,
        status: isOccupied
          ? 'occupied'
          : reservation
            ? 'reserved'
            : 'available',
        reserved_by: reservation?.user_id || null,
      };
    });

    return {
      busScheduleId,
      busNumber: bus?.bus_number,
      busType: bus?.type,
      totalSeats: allSeats.length,
      availableSeats:
        allSeats.length -
        takenSeatNumbers.length -
        reservedSeatNumbers.length +
        takenSeatNumbers.filter((s) => reservedSeatNumbers.includes(s)).length,
      seats: seatMap,
      route: busSchedule.schedule?.route,
      departure_time: busSchedule.schedule?.departure_time,
      arrival_time: busSchedule.schedule?.arrival_time,
    };
  }

  private async countUserTicketsForSchedule(
    userId: number,
    busScheduleId: number,
  ): Promise<number> {
    const existingTickets = await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.booking', 'booking')
      .where('booking.user_id = :userId', { userId })
      .andWhere('booking.bus_schedule_id = :busScheduleId', { busScheduleId })
      .andWhere('booking.status NOT IN (:...statuses)', {
        statuses: ['Отменен', 'истек'],
      })
      .getCount();

    const activeReservations = await this.reservationRepository.count({
      where: {
        user_id: userId,
        bus_schedule_id: busScheduleId,
        status: 'reserved',
        expires_at: MoreThan(new Date()),
      },
    });

    return existingTickets + activeReservations;
  }

  async reserve(
    createDto: CreateSeatReservationDto,
  ): Promise<SeatReservation | { error: string }> {
    const now = new Date();

    await this.reservationRepository.delete({
      status: 'reserved',
      expires_at: LessThan(now),
    });

    const currentCount = await this.countUserTicketsForSchedule(
      createDto.user_id,
      createDto.bus_schedule_id,
    );
    if (currentCount >= 5) {
      return { error: 'Нельзя забронировать больше 5 билетов на один маршрут' };
    }

    const busSchedule = await this.busScheduleRepository.findOne({
      where: { id: createDto.bus_schedule_id },
      relations: ['schedule', 'schedule.route', 'bus'],
    });
    if (!busSchedule) return { error: 'Расписание не найдено' };

    const bus = busSchedule.bus;
    if (!bus?.capacity || !bus.capacity.includes(createDto.seat_number)) {
      return { error: 'Место не существует в данном автобусе' };
    }

    const takenTickets = await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.booking', 'booking')
      .where('booking.bus_schedule_id = :busScheduleId', {
        busScheduleId: createDto.bus_schedule_id,
      })
      .andWhere('booking.status NOT IN (:...statuses)', {
        statuses: ['Отменен', 'истек'],
      })
      .andWhere('ticket.seat_number = :seatNumber', {
        seatNumber: createDto.seat_number,
      })
      .getOne();

    if (takenTickets) {
      return { error: 'Место уже занято' };
    }

    const existingReservation = await this.reservationRepository.findOne({
      where: {
        bus_schedule_id: createDto.bus_schedule_id,
        seat_number: createDto.seat_number,
        status: 'reserved',
      },
    });

    if (existingReservation) {
      if (existingReservation.user_id !== createDto.user_id) {
        return { error: 'Место уже забронировано другим пользователем' };
      }
      return existingReservation;
    }

    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    const reservation = this.reservationRepository.create({
      bus_schedule_id: createDto.bus_schedule_id,
      seat_number: createDto.seat_number,
      user_id: createDto.user_id,
      status: 'reserved',
      expires_at: expiresAt,
      boarding_point: createDto.boarding_point || undefined,
      is_child: createDto.is_child || false,
      price: createDto.is_child
        ? 0
        : createDto.price || busSchedule.schedule?.route?.price || 0,
    });

    return await this.reservationRepository.save(reservation);
  }

  async cancelReservation(id: number, userId: number) {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });
    if (!reservation) return { error: 'Резервация не найдена' };
    if (reservation.user_id !== userId) return { error: 'Нет прав для отмены' };
    if (reservation.status !== 'reserved')
      return { error: 'Резервация уже не активна' };

    await this.reservationRepository.remove(reservation);
    return { success: true };
  }

  async cancelAllReservations(userId: number, busScheduleId: number) {
    await this.reservationRepository.delete({
      user_id: userId,
      bus_schedule_id: busScheduleId,
      status: 'reserved',
    });
    return { success: true };
  }

  async confirmReservations(
    userId: number,
    busScheduleId: number,
    boardingPoint: string,
  ) {
    const now = new Date();

    const reservations = await this.reservationRepository.find({
      where: {
        user_id: userId,
        bus_schedule_id: busScheduleId,
        status: 'reserved',
      },
    });

    const validReservations = reservations.filter((r) => r.expires_at > now);

    if (validReservations.length === 0) {
      return { error: 'Нет активных резерваций для подтверждения' };
    }

    const existingTicketCount = await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.booking', 'booking')
      .where('booking.user_id = :userId', { userId })
      .andWhere('booking.bus_schedule_id = :busScheduleId', { busScheduleId })
      .andWhere('booking.status NOT IN (:...statuses)', {
        statuses: ['Отменен', 'истек'],
      })
      .getCount();

    if (existingTicketCount + validReservations.length > 5) {
      return { error: 'Нельзя забронировать больше 5 билетов на один маршрут' };
    }

    for (const res of validReservations) {
      const takenTicket = await this.ticketRepository
        .createQueryBuilder('ticket')
        .innerJoin('ticket.booking', 'booking')
        .where('booking.bus_schedule_id = :busScheduleId', {
          busScheduleId: res.bus_schedule_id,
        })
        .andWhere('booking.status NOT IN (:...statuses)', {
          statuses: ['Отменен', 'истек'],
        })
        .andWhere('ticket.seat_number = :seatNumber', {
          seatNumber: res.seat_number,
        })
        .getOne();

      if (takenTicket) {
        await this.reservationRepository.remove(res);
        continue;
      }

      const existingBooking = await this.bookingRepository.findOne({
        where: {
          user_id: userId,
          bus_schedule_id: busScheduleId,
          status: 'Выбран',
        },
      });

      let booking: Booking;
      if (existingBooking) {
        booking = existingBooking;
      } else {
        booking = this.bookingRepository.create({
          user_id: userId,
          bus_schedule_id: busScheduleId,
          booking_date: new Date().toISOString(),
          status: 'Выбран',
          boarding_point: boardingPoint,
        });
        booking = await this.bookingRepository.save(booking);
      }

      const ticket = this.ticketRepository.create({
        booking_id: booking.id,
        seat_number: res.seat_number,
        is_child: res.is_child,
        price: res.is_child ? 0 : res.price || 0,
      });
      await this.ticketRepository.save(ticket);

      res.status = 'confirmed';
      await this.reservationRepository.save(res);
    }

    await this.reservationRepository.remove(
      reservations.filter((r) => !validReservations.includes(r)),
    );

    const booking = await this.bookingRepository.findOne({
      where: {
        user_id: userId,
        bus_schedule_id: busScheduleId,
        status: 'Выбран',
      },
      relations: [
        'busSchedule',
        'busSchedule.schedule',
        'busSchedule.schedule.route',
        'busSchedule.bus',
      ],
    });

    const tickets = await this.ticketRepository.find({
      where: { booking_id: booking!.id },
    });

    return { booking: booking!, tickets };
  }

  async getUserReservations(userId: number, busScheduleId?: number) {
    const now = new Date();

    await this.reservationRepository.delete({
      status: 'reserved',
      expires_at: LessThan(now),
    });

    const where: any = { user_id: userId, status: 'reserved' };
    if (busScheduleId) where.bus_schedule_id = busScheduleId;

    return this.reservationRepository.find({ where });
  }

  async cleanupExpiredReservations() {
    const now = new Date();
    const result = await this.reservationRepository.delete({
      status: 'reserved',
      expires_at: LessThan(now),
    });
    return result.affected || 0;
  }

  @Cron('*/1 * * * *')
  async handleExpiredReservations() {
    await this.cleanupExpiredReservations();
  }
}
