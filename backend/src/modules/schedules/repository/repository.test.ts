import { DataSource, Repository } from 'typeorm';
import { ScheduleRepository } from './repository';
import { Schedule } from '../entities/Schedule';

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

describe('ScheduleRepository', () => {
  let dataSource: any;
  let repository: any;
  let scheduleRepository: ScheduleRepository;

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
    scheduleRepository = new ScheduleRepository(dataSource as unknown as DataSource);
  });

  it('should create a schedule', async () => {
    const scheduleData = { route_id: 1, departure_time: new Date(), arrival_time: new Date() };
    const createdSchedule = { ...scheduleData, id: 1 };
    repository.create.mockReturnValue(createdSchedule);
    repository.save.mockResolvedValue(createdSchedule);
    const result = await scheduleRepository.create(scheduleData);
    expect(repository.create).toHaveBeenCalledWith(scheduleData);
    expect(repository.save).toHaveBeenCalledWith(createdSchedule);
    expect(result).toEqual(createdSchedule);
  });

  it('should find schedule by id', async () => {
    const schedule = { id: 1, route_id: 1, departure_time: new Date(), arrival_time: new Date() };
    repository.findOneBy.mockResolvedValue(schedule);
    const result = await scheduleRepository.findOneById(1);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(schedule);
  });

  it('should return all schedules', async () => {
    const schedules = [
      { id: 1, route_id: 1, departure_time: new Date(), arrival_time: new Date() },
      { id: 2, route_id: 2, departure_time: new Date(), arrival_time: new Date() }
    ];
    repository.find.mockResolvedValue(schedules);
    const result = await scheduleRepository.findAll();
    expect(repository.find).toHaveBeenCalled();
    expect(result).toEqual(schedules);
  });

  it('should update a schedule if exists', async () => {
    const id = 1;
    const oldSchedule = { id, route_id: 1, departure_time: new Date(), arrival_time: new Date() };
    const updatedSchedule = { ...oldSchedule, route_id: 2 };
    scheduleRepository.findOneById = jest.fn()
      .mockResolvedValueOnce(oldSchedule)
      .mockResolvedValueOnce(updatedSchedule);
    repository.update.mockResolvedValue(undefined);
    const result = await scheduleRepository.update(id, { route_id: 2 });
    expect(scheduleRepository.findOneById).toHaveBeenCalledWith(id);
    expect(repository.update).toHaveBeenCalledWith(id, { route_id: 2 });
    expect(scheduleRepository.findOneById).toHaveBeenCalledTimes(2);
    expect(result).toEqual(updatedSchedule);
  });

  it('should return null when updating non-existing schedule', async () => {
    const id = 999;
    scheduleRepository.findOneById = jest.fn().mockResolvedValue(null);
    const result = await scheduleRepository.update(id, { route_id: 2 });
    expect(scheduleRepository.findOneById).toHaveBeenCalledWith(id);
    expect(result).toBeNull();
  });

  it('should delete a schedule and return true if affected', async () => {
    repository.delete.mockResolvedValue({ affected: 1 });
    const result = await scheduleRepository.delete(1);
    expect(repository.delete).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });

  it('should delete a schedule and return false if not affected', async () => {
    repository.delete.mockResolvedValue({ affected: 0 });
    const result = await scheduleRepository.delete(2);
    expect(repository.delete).toHaveBeenCalledWith(2);
    expect(result).toBe(false);
  });

  it('should delete by route id and return affected count', async () => {
    repository.delete.mockResolvedValue({ affected: 3 });
    const result = await scheduleRepository.deleteByRouteId(1);
    expect(repository.delete).toHaveBeenCalledWith({ route: { id: 1 } });
    expect(result).toBe(3);
  });
}); 