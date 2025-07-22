export interface IRepository<T> {
    create(data: Partial<T>): Promise<T>;
    findOneById(id: number): Promise<T | null>;
    findAll(): Promise<T[]>;
    update(id: number, data: Partial<T>): Promise<T | null>;
    delete(id: number): Promise<boolean>;
  }
  