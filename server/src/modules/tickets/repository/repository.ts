import { Repository, DataSource } from "typeorm";
import { AppDataSource } from "../../../config/db.spec";
import { IRepository } from "../../../shared/interfaces/IRepository";
import { Ticket } from "../entities/tickets";

class TicketRepository implements IRepository<Ticket> {
  private repository: Repository<Ticket>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Ticket);
  }

  async create(data: Partial<Ticket>): Promise<Ticket> {
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