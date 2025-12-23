import { Repository, DataSource } from "typeorm";
import { BusSchedule } from "../entities/BusSchedule";
import { AppDataSource } from "../../../config/db.config";
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

  async findOneByBusId(bus_id: number): Promise<BusSchedule[] | null> {
    const busSchedules = await this.repository.findBy({ bus_id });

    return busSchedules;
  }

  async findAll(): Promise<BusSchedule[]> {
    const busSchedules = await this.repository
      .createQueryBuilder("busSchedule")
      .leftJoinAndSelect("busSchedule.schedule", "schedule")
      .leftJoinAndSelect("schedule.route", "route")
      .leftJoinAndSelect("busSchedule.bus", "bus")
      .where("bus.capacity != :capacity", { capacity: {} }) // Условие: исключаем capacity = 0
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

  async replaceDriverAndBus(id: number, bus_id?: number): Promise<BusSchedule | null> {
    const busSchedule = await this.findOneById(id);
    if (!busSchedule) return null;

    const updateData: Partial<BusSchedule> = { bus_id };
    //if (typeof bus_id !== 'undefined') updateData.bus_id = bus_id;

    //if (Object.keys(updateData).length === 0) return busSchedule;

    await this.repository.update(id, updateData);
    return await this.findOneById(id);
  }

  async addVisitedStop(id: number, stopId: number): Promise<BusSchedule | null> {
    const busSchedule = await this.findOneById(id);
    if (!busSchedule) return null;

    const visited = busSchedule.visited_stops || [];
    if (!visited.includes(stopId)) {
      visited.push(stopId);
      await this.repository.update(id, { visited_stops: visited });
    }
    return await this.findOneById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}

export const busScheduleRepository = new BusScheduleRepository(AppDataSource);