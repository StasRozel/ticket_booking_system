import { Repository, DataSource } from "typeorm";
import { Bus } from "../entities/Bus";
import { AppDataSource } from "../../../config/db.config";
import { IRepository } from "../../../shared/interfaces/IRepository";

export class BusRepository implements IRepository<Bus> {
  private repository: Repository<Bus>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Bus);
  }

  async create(data: Partial<Bus>): Promise<Bus> {
    // Create an array of sequential numbers from 1 to capacity
    const totalCapacity = Number(data.capacity[0]);
    data.capacity = Array.from({ length: totalCapacity }, (_, i) => i + 1);
    
    const Bus = this.repository.create(data);
    return await this.repository.save(Bus);
  }

  async findOneById(id: number): Promise<Bus | null> {
    return await this.repository.findOneBy({ id });
  }

  async findAll(): Promise<Bus[]> {
    return await this.repository.find();
  }

  async update(id: number, data: Partial<Bus>): Promise<Bus | null> {
    const Bus = await this.findOneById(id);
    if (!Bus) {
      return null;
    }
    
    // Only initialize capacity if this is a new capacity value and not an update to existing seats
    if (data.capacity[1] == -1) {
      const totalCapacity = Number(data.capacity[0]);
      console.log(data.capacity);
      data.capacity = Array.from({ length: totalCapacity }, (_, i) => i + 1);
    }
    
    await this.repository.update(id, data);
    return await this.findOneById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}

export const busRepository = new BusRepository(AppDataSource);