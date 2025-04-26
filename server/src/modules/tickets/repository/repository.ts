import { Repository, DataSource } from "typeorm";
import { AppDataSource } from "../../../config/db.spec";
import { IRepository } from "../../../shared/interfaces/IRepository";
import { Ticket } from "../entities/tickets";
import { Booking } from "../../bookings/entities/booking";

class TicketRepository implements IRepository<Ticket> {
  private repository: Repository<Ticket>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Ticket);
  }

  async create(data: Partial<Ticket>): Promise<Ticket> {
    const ticket = await this.checkTicketIsBookingId(data.booking_id, data.is_child);

    if (ticket) return await this.update(ticket.id, { seat_number: ticket.seat_number })

    const Ticket = this.repository.create(data);
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

  async checkTicketIsBookingId(booking_id: number, is_child: boolean): Promise<Ticket | null> {
    const ticket = await this.repository.findBy({ booking_id, is_child });
    if (ticket.length > 0) {
      ticket[0].seat_number++;
      return ticket[0];
    }
    return null;
  }

  async update(id: number, data: Partial<Ticket>): Promise<Ticket | null> {
    const Ticket = await this.findOneById(id);
    if (!Ticket) {
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

export const ticketRepository = new TicketRepository(AppDataSource);