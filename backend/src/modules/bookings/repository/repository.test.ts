import { DataSource, Repository } from 'typeorm';
import { Booking } from '../entities/booking';
import { BookingRepository } from './repository';

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
      findBy: jest.fn(),
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

jest.mock('../../tickets/repository/repository', () => ({
  ticketRepository: { findByBookingId: jest.fn() }
}));
jest.mock('../../busschedules/repository/repository', () => ({
  busScheduleRepository: { findOneById: jest.fn() }
}));
jest.mock('../../buses/repository/repository', () => ({
  busRepository: { findOneById: jest.fn(), update: jest.fn() }
}));

describe('BookingRepository', () => {
  let bookingRepository: BookingRepository;
  let mockRepo: any;
  let mockDataSource: any;

  beforeEach(() => {
    mockRepo = new (Repository as any)();
    mockDataSource = new (DataSource as any)();
    mockDataSource.getRepository.mockReturnValue(mockRepo);
    bookingRepository = new BookingRepository(mockDataSource);
  });

  it('create: should create and save booking', async () => {
    mockRepo.findBy.mockResolvedValue([]);
    mockRepo.create.mockReturnValue({ id: 1 });
    mockRepo.save.mockResolvedValue({ id: 1 });
    const result = await bookingRepository.create({ user_id: 1, bus_schedule_id: 2 });
    expect(result).toEqual({ id: 1 });
  });

  it('findOneById: should return booking by id', async () => {
    mockRepo.findOneBy.mockResolvedValue({ id: 1 });
    const result = await bookingRepository.findOneById(1);
    expect(result).toEqual({ id: 1 });
  });

  it('findAll: should return all bookings', async () => {
    mockRepo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await bookingRepository.findAll();
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('findAllByUserId: should return bookings by user id', async () => {
    const mockQuery = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 1 }])
    };
    mockRepo.createQueryBuilder.mockReturnValue(mockQuery);
    const result = await bookingRepository.findAllByUserId(1);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('checkByIsSelect: should return booking id if found', async () => {
    mockRepo.findBy.mockResolvedValue([{ id: 5 }]);
    const result = await bookingRepository.checkByIsSelect(1, 2);
    expect(result).toBe(5);
  });

  it('checkByIsSelect: should return 0 if not found', async () => {
    mockRepo.findBy.mockResolvedValue([]);
    const result = await bookingRepository.checkByIsSelect(1, 2);
    expect(result).toBe(0);
  });

  it('update: should update and return booking', async () => {
    mockRepo.findOneBy.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 1, updated: true });
    mockRepo.update.mockResolvedValue({});
    const result = await bookingRepository.update(1, { status: 'updated' });
    expect(result).toEqual({ id: 1, updated: true });
  });

  it('update: should return null if booking not found', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);
    const result = await bookingRepository.update(1, { status: 'updated' });
    expect(result).toBeNull();
  });

  it('delete: should return true if deleted', async () => {
    mockRepo.delete.mockResolvedValue({ affected: 1 });
    const result = await bookingRepository.delete(1);
    expect(result).toBe(true);
  });

  it('delete: should return false if not deleted', async () => {
    mockRepo.delete.mockResolvedValue({ affected: 0 });
    const result = await bookingRepository.delete(1);
    expect(result).toBe(false);
  });
}); 