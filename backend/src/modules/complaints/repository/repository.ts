import { Repository, DataSource } from "typeorm";
import { DriverComplaint } from "../entities/driverComplaint";
import { IRepository } from "../../../shared/interfaces/IRepository";
import { AppDataSource } from "../../../config/db.config";

export class DriverComplaintRepository implements IRepository<DriverComplaint> {
  private repository: Repository<DriverComplaint>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(DriverComplaint);
  }

  async create(data: Partial<DriverComplaint>): Promise<DriverComplaint> {    
    const driverComplaint = this.repository.create(data);
    return await this.repository.save(driverComplaint);
  }

  async findOneById(id: number): Promise<DriverComplaint | null> {
    return await this.repository.findOneBy({ id });
  }

  async findOneByUserId(userId: number): Promise<DriverComplaint | null> {
    return await this.repository.findOneBy({ userId });
  }

  async findAll(): Promise<DriverComplaint[]> {
    return await this.repository.find();
  }

  async update(id: number, data: Partial<DriverComplaint>): Promise<DriverComplaint | null> {
    const driverComplaint = await this.findOneById(id);
    if (!driverComplaint) {
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

export const driverComplaintRepository = new DriverComplaintRepository(AppDataSource);