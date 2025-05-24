import { DataSource, Repository } from 'typeorm';
import { RouteRepository } from './repository';
import { Route } from '../entities/Route';

jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    DataSource: jest.fn().mockImplementation(() => ({ getRepository: jest.fn() })),
    Repository: jest.fn().mockImplementation(() => ({
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }))
  };
});

describe('RouteRepository', () => {
  let dataSource: any;
  let repository: any;
  let routeRepository: RouteRepository;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    dataSource = { getRepository: jest.fn().mockReturnValue(repository) };
    routeRepository = new RouteRepository(dataSource as unknown as DataSource);
  });

  it('should create a route', async () => {
    const routeData = { name: 'A', starting_point: 'B', ending_point: 'C', stops: '', distance: 10, price: 100 };
    const createdRoute = { ...routeData, id: 1 };
    repository.create.mockReturnValue(createdRoute);
    repository.save.mockResolvedValue(createdRoute);
    const result = await routeRepository.create(routeData);
    expect(repository.create).toHaveBeenCalledWith(routeData);
    expect(repository.save).toHaveBeenCalledWith(createdRoute);
    expect(result).toEqual(createdRoute);
  });

  it('should find route by id', async () => {
    const route = { id: 1, name: 'A', starting_point: 'B', ending_point: 'C', stops: '', distance: 10, price: 100 };
    repository.findOneBy.mockResolvedValue(route);
    const result = await routeRepository.findOneById(1);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(route);
  });

  it('should return all routes', async () => {
    const routes = [
      { id: 1, name: 'A', starting_point: 'B', ending_point: 'C', stops: '', distance: 10, price: 100 },
      { id: 2, name: 'D', starting_point: 'E', ending_point: 'F', stops: '', distance: 20, price: 200 }
    ];
    repository.find.mockResolvedValue(routes);
    const result = await routeRepository.findAll();
    expect(repository.find).toHaveBeenCalled();
    expect(result).toEqual(routes);
  });

  it('should return price by route id', async () => {
    const route = { id: 1, name: 'A', starting_point: 'B', ending_point: 'C', stops: '', distance: 10, price: 100 };
    repository.findOneBy.mockResolvedValue(route);
    const result = await routeRepository.findPriceById(1);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toBe(100);
  });

  it('should update a route if exists', async () => {
    const id = 1;
    const oldRoute = { id, name: 'A', starting_point: 'B', ending_point: 'C', stops: '', distance: 10, price: 100 };
    const updatedRoute = { ...oldRoute, name: 'Updated' };
    routeRepository.findOneById = jest.fn()
      .mockResolvedValueOnce(oldRoute)
      .mockResolvedValueOnce(updatedRoute);
    repository.update.mockResolvedValue(undefined);
    const result = await routeRepository.update(id, { name: 'Updated' });
    expect(routeRepository.findOneById).toHaveBeenCalledWith(id);
    expect(repository.update).toHaveBeenCalledWith(id, { name: 'Updated' });
    expect(routeRepository.findOneById).toHaveBeenCalledTimes(2);
    expect(result).toEqual(updatedRoute);
  });

  it('should return null when updating non-existing route', async () => {
    const id = 999;
    routeRepository.findOneById = jest.fn().mockResolvedValue(null);
    const result = await routeRepository.update(id, { name: 'Nope' });
    expect(routeRepository.findOneById).toHaveBeenCalledWith(id);
    expect(result).toBeNull();
  });

  it('should delete a route and return true if affected', async () => {
    repository.delete.mockResolvedValue({ affected: 1 });
    const result = await routeRepository.delete(1);
    expect(repository.delete).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });

  it('should delete a route and return false if not affected', async () => {
    repository.delete.mockResolvedValue({ affected: 0 });
    const result = await routeRepository.delete(2);
    expect(repository.delete).toHaveBeenCalledWith(2);
    expect(result).toBe(false);
  });
}); 