import { Repository, DataSource } from "typeorm";
import { Route } from "../entities/Route";
import { AppDataSource } from "../../../config/db.config";
import { IRepository } from "../../../shared/interfaces/IRepository";

export class RouteRepository implements IRepository<Route> {
  private repository: Repository<Route>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Route);
  }

  async create(data: Partial<Route>): Promise<Route> {
    const Route = this.repository.create(data);
    return await this.repository.save(Route);
  }

  async findOneById(id: number): Promise<Route | null> {
    return await this.repository.findOneBy({ id });
  }

  async findPriceById(id: number): Promise<number | null> {
    return (await this.repository.findOneBy({ id })).price;
  }


  async findAll(): Promise<Route[]> {
    return await this.repository.find();
  }

  async update(id: number, data: Partial<Route>): Promise<Route | null> {
    const Route = await this.findOneById(id);
    if (!Route) {
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

export const routeRepository = new RouteRepository(AppDataSource);