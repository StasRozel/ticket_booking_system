import { Repository, DataSource } from "typeorm";
import { BusSchedule } from "../entities/BusSchedule";
import { AppDataSource } from "../../../config/db.spec";
import { IRepository } from "../../../shared/interfaces/IRepository";

export class BusScheduleRepository implements IRepository<BusSchedule> {
  private repository: Repository<BusSchedule>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(BusSchedule);
  }

  async create(data: Partial<BusSchedule>): Promise<BusSchedule> {
    const BusSchedule = this.repository.create(data);
    return await this.repository.save(BusSchedule);
  }

  async findOneById(id: number): Promise<BusSchedule | null> {
    const busSchedules = await this.repository
      .createQueryBuilder("busSchedule")
      .leftJoinAndSelect("busSchedule.schedule", "schedule")
      .leftJoinAndSelect("schedule.route", "route")
      .leftJoinAndSelect("busSchedule.bus", "bus")
      .where({ id })
      .getOne();
    return busSchedules;
  }

  async findAll(): Promise<BusSchedule[]> {
    const busSchedules = await this.repository
      .createQueryBuilder("busSchedule")
      .leftJoinAndSelect("busSchedule.schedule", "schedule")
      .leftJoinAndSelect("schedule.route", "route")
      .leftJoinAndSelect("busSchedule.bus", "bus")
      .getMany();
    return busSchedules;
  }

  async update(id: number, data: Partial<BusSchedule>): Promise<BusSchedule | null> {
    const BusSchedule = await this.findOneById(id);
    if (!BusSchedule) {
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

export const busScheduleRepository = new BusScheduleRepository(AppDataSource);