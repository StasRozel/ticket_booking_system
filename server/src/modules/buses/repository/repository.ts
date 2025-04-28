import { Repository, DataSource } from "typeorm";
import { Bus } from "../entities/Bus";
import { AppDataSource } from "../../../config/db.spec";
import { IRepository } from "../../../shared/interfaces/IRepository";

export class BusRepository implements IRepository<Bus> {
  private repository: Repository<Bus>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Bus);
  }

  async create(data: Partial<Bus>): Promise<Bus> {
    data.capacity = [...this.range(1, Number(data.capacity))];
    const Bus = this.repository.create(data);
    return await this.repository.save(Bus);
  }

  private *range(s: number, e: number) { while (s <= e) yield s++ }

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

    await this.repository.update(id, data);
    return await this.findOneById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}

export const busRepository = new BusRepository(AppDataSource);