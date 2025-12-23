import { Repository, DataSource } from "typeorm";
import { Driver } from "./entities/driver";
import { IRepository } from "../../shared/interfaces/IRepository";
import { AppDataSource } from "../../config/db.config";

export class DriverRepository implements IRepository<Driver> {
  private repository: Repository<Driver>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Driver);
  }

  async create(data: Partial<Driver>): Promise<Driver> {    
    const Driver = this.repository.create(data);
    return await this.repository.save(Driver);
  }

  async findOneById(id: number): Promise<Driver | null> {
    return await this.repository.findOneBy({ id });
  }

  async findOneByUserId(user_id: number): Promise<Driver | null> {
    return await this.repository.findOneBy({ user_id });
  }

  async findAll(): Promise<Driver[]> {
    return await this.repository.find();
  }

  async update(id: number, data: Partial<Driver>): Promise<Driver | null> {
    const Driver = await this.findOneById(id);
    if (!Driver) {
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

export const driverRepository = new DriverRepository(AppDataSource);