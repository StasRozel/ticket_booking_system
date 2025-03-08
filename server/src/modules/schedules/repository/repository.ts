import { Repository, DataSource } from "typeorm";
import { AppDataSource } from "../../../config/db.spec";
import { IRepository } from "../../../shared/interfaces/IRepository";
import { Schedule } from "../entities/Schedule";

export class ScheduleRepository implements IRepository<Schedule> {
  private repository: Repository<Schedule>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Schedule);
  }

  async create(data: Partial<Schedule>): Promise<Schedule> {
    const Schedule = this.repository.create(data);
    return await this.repository.save(Schedule);
  }

  async findOneById(id: number): Promise<Schedule | null> {
    return await this.repository.findOneBy({ id });
  }

  async findAll(): Promise<Schedule[]> {
    return await this.repository.find();
  }

  async update(id: number, data: Partial<Schedule>): Promise<Schedule | null> {
    const Schedule = await this.findOneById(id);
    if (!Schedule) {
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

export const scheduleRepository = new ScheduleRepository(AppDataSource);