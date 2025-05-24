import { Repository, DataSource } from "typeorm";
import { AppDataSource } from "../../../config/db.config";
import { IRepository } from "../../../shared/interfaces/IRepository";
import { Ticket } from "../entities/tickets";
import { busRepository } from "../../buses/repository/repository";
import { bookingRepository } from "../../bookings/repository/repository";
import { busScheduleRepository } from "../../busschedules/repository/repository";

export class TicketRepository implements IRepository<Ticket> {
  private repository: Repository<Ticket>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Ticket);
  }

  async create(data: Partial<Ticket>): Promise<Ticket> {
    const booking = await bookingRepository.findOneById(data.booking_id);
    const busSchedule = await busScheduleRepository.findOneById(booking.bus_schedule_id);
    const bus = await busRepository.findOneById(busSchedule.bus_id);
    const seats = new Set(this.sortSet(bus.capacity));

    data.seat_number = seats.values().next().value;
    const Ticket = this.repository.create(data);
    seats.delete(data.seat_number);
    await busRepository.update(bus.id, { capacity: [...seats] });
    return await this.repository.save(Ticket);
  }

  sortSet(arr: number[]): number[] {
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - 1 - i; j++) {
        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
        }
      }
    }

    return arr;
  }

  async findOneById(id: number): Promise<Ticket | null> {
    return await this.repository.findOneBy({ id });
  }

  async findByBookingId(booking_id: number): Promise<Ticket[] | null> {
    return await this.repository.findBy({ booking_id });
  }

  async findAll(): Promise<Ticket[]> {
    return await this.repository.find();
  }

  async update(id: number, data: Partial<Ticket>): Promise<Ticket | null> {
    const Ticket = await this.findOneById(id);
    if (!Ticket) {
      return null;
    }
    if (data.is_child) data.price = 0;
    
    await this.repository.update(id, data);
    return await this.findOneById(id);
  }

  async cansel(id: number, data: Partial<Ticket>) {
      const booking = await bookingRepository.findOneById(data.booking_id);
      const busSchedule = await busScheduleRepository.findOneById(booking.bus_schedule_id);
      const bus = await busRepository.findOneById(busSchedule.bus_id);
      const seats = new Set(bus.capacity);
      seats.add(data.seat_number);
      await busRepository.update(bus.id, { capacity: [...seats] });
      await this.repository.delete(id);
      return await this.findOneById(id);
    }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}

export const ticketRepository = new TicketRepository(AppDataSource);