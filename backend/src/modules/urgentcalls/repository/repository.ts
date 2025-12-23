import { Repository, DataSource } from "typeorm";
import { AppDataSource } from "../../../config/db.config";
import { IRepository } from "../../../shared/interfaces/IRepository";
import { UrgentCall } from "../entities/urgentCall";

export class UrgentCallRepository implements IRepository<UrgentCall> {
  private repository: Repository<UrgentCall>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(UrgentCall);
  }

  async create(data: Partial<UrgentCall>): Promise<UrgentCall> {
    const urgentCall = this.repository.create(data);
    return await this.repository.save(urgentCall);
  }

  async findOneById(id: number): Promise<UrgentCall | null> {
    return await this.repository.findOneBy({ id });
  }


  async findAll(): Promise<UrgentCall[]> {
    return await this.repository.find();
  }

  async update(id: number, data: Partial<UrgentCall>): Promise<UrgentCall | null> {
    const urgentCall = await this.findOneById(id);
    if (!urgentCall) {
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

export const urgentCallRepository = new UrgentCallRepository(AppDataSource);