import { DataSource, Repository } from 'typeorm';
import { BusSchedule } from '../entities/BusSchedule';
import { BusScheduleRepository } from './repository';

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
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getOne: jest.fn()
      })
    }))
  };
});

describe('BusScheduleRepository', () => {
  let busScheduleRepository: BusScheduleRepository;
  let mockRepo: any;
  let mockDataSource: any;

  beforeEach(() => {
    mockRepo = new (Repository as any)();
    mockDataSource = new (DataSource as any)();
    mockDataSource.getRepository.mockReturnValue(mockRepo);
    busScheduleRepository = new BusScheduleRepository(mockDataSource);
  });

  it('create: should create and save bus schedule', async () => {
    mockRepo.create.mockReturnValue({ id: 1 });
    mockRepo.save.mockResolvedValue({ id: 1 });
    const result = await busScheduleRepository.create({});
    expect(result).toEqual({ id: 1 });
  });

  it('findOneById: should return bus schedule by id', async () => {
    const mockQuery = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ id: 1 })
    };
    mockRepo.createQueryBuilder.mockReturnValue(mockQuery);
    const result = await busScheduleRepository.findOneById(1);
    expect(result).toEqual({ id: 1 });
  });

  it('findAll: should return all bus schedules', async () => {
    const mockQuery = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
    };
    mockRepo.createQueryBuilder.mockReturnValue(mockQuery);
    const result = await busScheduleRepository.findAll();
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('update: should update and return bus schedule', async () => {
    const mockQuery = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn()
    };
    mockQuery.getOne.mockResolvedValueOnce({ id: 1 });
    mockQuery.getOne.mockResolvedValueOnce({ id: 1, bus_id: 2 });
    mockRepo.createQueryBuilder.mockReturnValue(mockQuery);
    mockRepo.update.mockResolvedValue({});
    const result = await busScheduleRepository.update(1, { bus_id: 2 });
    expect(result).toEqual({ id: 1, bus_id: 2 });
  });

  it('update: should return null if bus schedule not found', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);
    const result = await busScheduleRepository.update(1, { bus_id: 2 });
    expect(result).toBeNull();
  });

  it('delete: should return true if deleted', async () => {
    mockRepo.delete.mockResolvedValue({ affected: 1 });
    const result = await busScheduleRepository.delete(1);
    expect(result).toBe(true);
  });

  it('delete: should return false if not deleted', async () => {
    mockRepo.delete.mockResolvedValue({ affected: 0 });
    const result = await busScheduleRepository.delete(1);
    expect(result).toBe(false);
  });
}); 