import { DataSource, Repository } from 'typeorm';
import { BusRepository } from './repository';
import { Bus } from '../entities/Bus';

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

describe('BusRepository', () => {
  let dataSource: any;
  let repository: any;
  let busRepository: BusRepository;

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
    busRepository = new BusRepository(dataSource as unknown as DataSource);
  });

  it('should create a bus', async () => {
    const busData = { bus_number: '123', capacity: [10], type: 'mini', available: true };
    const createdBus = { ...busData, capacity: [1,2,3,4,5,6,7,8,9,10], id: 1 };
    repository.create.mockReturnValue(createdBus);
    repository.save.mockResolvedValue(createdBus);
    const result = await busRepository.create(busData);
    expect(repository.create).toHaveBeenCalledWith({ ...busData, capacity: [1,2,3,4,5,6,7,8,9,10] });
    expect(repository.save).toHaveBeenCalledWith(createdBus);
    expect(result).toEqual(createdBus);
  });

  it('should find bus by id', async () => {
    const bus = { id: 1, bus_number: '123', capacity: [1,2,3], type: 'mini', available: true };
    repository.findOneBy.mockResolvedValue(bus);
    const result = await busRepository.findOneById(1);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(bus);
  });

  it('should return all buses', async () => {
    const buses = [
      { id: 1, bus_number: '123', capacity: [1,2,3], type: 'mini', available: true },
      { id: 2, bus_number: '456', capacity: [1,2,3,4], type: 'big', available: false }
    ];
    repository.find.mockResolvedValue(buses);
    const result = await busRepository.findAll();
    expect(repository.find).toHaveBeenCalled();
    expect(result).toEqual(buses);
  });

  it('should update a bus if exists', async () => {
    const id = 1;
    const oldBus = { id, bus_number: '123', capacity: [1,2,3], type: 'mini', available: true };
    const updatedBus = { ...oldBus, type: 'big', capacity: [1,2,3,4,5] };
    busRepository.findOneById = jest.fn()
      .mockResolvedValueOnce(oldBus)
      .mockResolvedValueOnce(updatedBus);
    repository.update.mockResolvedValue(undefined);
    const result = await busRepository.update(id, { type: 'big', capacity: [5] });
    expect(busRepository.findOneById).toHaveBeenCalledWith(id);
    expect(repository.update).toHaveBeenCalledWith(id, { type: 'big', capacity: [1,2,3,4,5] });
    expect(busRepository.findOneById).toHaveBeenCalledTimes(2);
    expect(result).toEqual(updatedBus);
  });

  it('should return null when updating non-existing bus', async () => {
    const id = 999;
    busRepository.findOneById = jest.fn().mockResolvedValue(null);
    const result = await busRepository.update(id, { type: 'big' });
    expect(busRepository.findOneById).toHaveBeenCalledWith(id);
    expect(result).toBeNull();
  });

  it('should delete a bus and return true if affected', async () => {
    repository.delete.mockResolvedValue({ affected: 1 });
    const result = await busRepository.delete(1);
    expect(repository.delete).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });

  it('should delete a bus and return false if not affected', async () => {
    repository.delete.mockResolvedValue({ affected: 0 });
    const result = await busRepository.delete(2);
    expect(repository.delete).toHaveBeenCalledWith(2);
    expect(result).toBe(false);
  });
}); 