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
    
    if (!bus || !bus.capacity || bus.capacity.length === 0) {
      throw new Error('No available seats');
    }

    // Get the current capacity array and sort it
    const sortedCapacity = [...bus.capacity].sort((a, b) => a - b);

    // Assign the first available seat
    data.seat_number = sortedCapacity[0];
    
    // Create the ticket
    const Ticket = this.repository.create(data);
    
    // Remove the assigned seat from capacity
    const updatedCapacity = sortedCapacity.slice(1);
    
    // Update bus with new capacity
    await busRepository.update(bus.id, { 
      capacity: updatedCapacity
    });
    
    return await this.repository.save(Ticket);
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
    
    // Get current capacity
    const currentCapacity = [...bus.capacity];
    
    // Find the correct position to insert the cancelled seat number
    let insertIndex = 0;
    while (insertIndex < currentCapacity.length && currentCapacity[insertIndex] < data.seat_number) {
      insertIndex++;
    }
    
    // Insert the cancelled seat number at the correct position
    const updatedCapacity = [
      ...currentCapacity.slice(0, insertIndex),
      data.seat_number,
      ...currentCapacity.slice(insertIndex)
    ];
    
    // Update bus with new capacity
    await busRepository.update(bus.id, { 
      capacity: updatedCapacity
    });
    
      await this.repository.delete(id);
      return await this.findOneById(id);
    }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}
/*Смотри какая ещё есть проблема,пользователь в расписании транспорта может писать id траснспорта и расписаиня, нужно сделать так чтобы валидировалось если был написан не существуюющий id это обработалось и не пошло дальше в бд а пользователю вывелось уведомление */
export const ticketRepository = new TicketRepository(AppDataSource);