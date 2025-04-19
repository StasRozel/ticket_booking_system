import { Repository, DataSource } from "typeorm";
import { AppDataSource } from "../../../config/db.spec";
import { IRepository } from "../../../shared/interfaces/IRepository";
import { Booking } from "../entities/booking";

class BookingRepository implements IRepository<Booking> {
  private repository: Repository<Booking>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Booking);
  }

  async create(data: Partial<Booking>): Promise<Booking> {
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

  async update(id: number, data: Partial<Booking>): Promise<Booking | null> {
    const Booking = await this.findOneById(id);
    if (!Booking) {
      return null;
    }

    await this.repository.update(id, data);
    return await this.findOneById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}

export const bookingRepository = new BookingRepository(AppDataSource);