import { Repository, DataSource } from "typeorm";
import { AppDataSource } from "../../../config/db.config";
import { IRepository } from "../../../shared/interfaces/IRepository";
import { Booking } from "../entities/booking";
import { busScheduleRepository } from "../../busschedules/repository/repository";
import { busRepository } from "../../buses/repository/repository";
import { ticketRepository } from "../../tickets/repository/repository";

export class BookingRepository implements IRepository<Booking> {
  private repository: Repository<Booking>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Booking);
  }

  async create(data: Partial<Booking>): Promise<Booking | null> {
    const id = await this.checkByIsSelect(data.user_id, data.bus_schedule_id);

    if (id) return await this.findOneById(id);

    const Booking = this.repository.create(data);
    return await this.repository.save(Booking);
  }

  async findOneById(id: number): Promise<Booking | null> {
    return await this.repository.findOneBy({ id });
  }

  async findAll(): Promise<Booking[]> {
    return await this.repository.find();
  }

  async findAllByUserId(user_id: number): Promise<Booking[]> {
    const booking = await this.repository
      .createQueryBuilder("booking")
      .leftJoinAndSelect("booking.busSchedule", "bus_schedule")
      .leftJoinAndSelect("bus_schedule.schedule", "schedule")
      .leftJoinAndSelect("schedule.route", "route")
      .leftJoinAndSelect("bus_schedule.bus", "bus")
      .where({ user_id })
      .getMany();
    return booking;
  }

  async checkByIsSelect(user_id: number, bus_schedule_id: number): Promise<number> {
    const booking: Booking[] = await this.repository.findBy({ user_id, bus_schedule_id, status: "Выбран" });
    return booking[0]?.id ?? 0;
  }

  async update(id: number, data: Partial<Booking>): Promise<Booking | null> {
    const Booking = await this.findOneById(id);
    if (!Booking) {
      return null;
    }

    await this.repository.update(id, data);
    return await this.findOneById(id);
  }

  async cansel(id: number, data: Partial<Booking>) {
    const tickets = await ticketRepository.findByBookingId(id);
    const booking = await bookingRepository.findOneById(id);
    const busSchedule = await busScheduleRepository.findOneById(booking.bus_schedule_id);
    const bus = await busRepository.findOneById(busSchedule.bus_id);
    const seats = new Set(bus.capacity);
    tickets.forEach(ticket => {
      seats.add(ticket.seat_number);
    });
    await busRepository.update(bus.id, { capacity: [...seats] });
    await this.repository.update(id, data);
    return await this.findOneById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}

export const bookingRepository = new BookingRepository(AppDataSource);