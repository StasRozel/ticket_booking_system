import { Repository, DataSource } from "typeorm";
import { User } from "../entities/user";
import { IRepository } from "../../../shared/interfaces/IRepository";
import { AppDataSource } from "../../../config/db.config";

export class UserRepository implements IRepository<User> {
  private repository: Repository<User>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(User);
  }

  async create(data: Partial<User>): Promise<User> {
    const User = this.repository.create(data);
    return await this.repository.save(User);
  }

  async save(data: User): Promise<void> {
    await this.repository.save(data);
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.repository.findOneBy({ id });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.repository.findOneBy({ email });
  }

  async findOne(option: object): Promise<User | null> {
    return await this.repository.findOneBy(option);
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find();
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    const User = await this.findOneById(id);
    if (!User) {
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

export const userRepository = new UserRepository(AppDataSource);