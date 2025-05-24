import { DataSource, Repository } from 'typeorm';
// import { Ticket } from '../entities/tickets'; // Удалено
import { TicketRepository } from './repository';
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
      delete: jest.fn()
    }))
  };
});

jest.mock('../../buses/repository/repository', () => ({
  busRepository: { findOneById: jest.fn(), update: jest.fn() }
}));
jest.mock('../../bookings/repository/repository', () => ({
  bookingRepository: { findOneById: jest.fn() }
}));
jest.mock('../../busschedules/repository/repository', () => ({
  busScheduleRepository: { findOneById: jest.fn() }
}));

describe('TicketRepository', () => {
  let ticketRepository: TicketRepository;
  let mockRepo: any;
  let mockDataSource: any;

  beforeEach(() => {
    mockRepo = new (Repository as any)();
    mockDataSource = new (DataSource as any)();
    mockDataSource.getRepository.mockReturnValue(mockRepo);
    ticketRepository = new TicketRepository(mockDataSource);
  });

  it('findOneById: should return ticket by id', async () => {
    mockRepo.findOneBy.mockResolvedValue({ id: 1 });
    const result = await ticketRepository.findOneById(1);
    expect(result).toEqual({ id: 1 });
  });

  it('findByBookingId: should return tickets by booking id', async () => {
    mockRepo.findBy.mockResolvedValue([{ id: 1 }]);
    const result = await ticketRepository.findByBookingId(1);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('findAll: should return all tickets', async () => {
    mockRepo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await ticketRepository.findAll();
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('update: should update and return ticket', async () => {
    mockRepo.findOneBy.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 1, updated: true });
    mockRepo.update.mockResolvedValue({});
    const result = await ticketRepository.update(1, { price: 100 });
    expect(result).toEqual({ id: 1, updated: true });
  });

  it('update: should return null if ticket not found', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);
    const result = await ticketRepository.update(1, { price: 100 });
    expect(result).toBeNull();
  });

  it('delete: should return true if deleted', async () => {
    mockRepo.delete.mockResolvedValue({ affected: 1 });
    const result = await ticketRepository.delete(1);
    expect(result).toBe(true);
  });

  it('delete: should return false if not deleted', async () => {
    mockRepo.delete.mockResolvedValue({ affected: 0 });
    const result = await ticketRepository.delete(1);
    expect(result).toBe(false);
  });

  it('create: should create multiple tickets', async () => {
    const ticketsToCreate = [
      { booking_id: 1, seat_number: 5, is_child: false, price: 100 },
      { booking_id: 2, seat_number: 3, is_child: true, price: 50 },
    ];
    // Мокаем зависимости
    const booking = { bus_schedule_id: 10 };
    const busSchedule = { bus_id: 20 };
    const bus = { id: 30, capacity: [5, 3, 1] };
    (require('../../bookings/repository/repository').bookingRepository.findOneById as jest.Mock).mockResolvedValue(booking);
    (require('../../busschedules/repository/repository').busScheduleRepository.findOneById as jest.Mock).mockResolvedValue(busSchedule);
    (require('../../buses/repository/repository').busRepository.findOneById as jest.Mock).mockResolvedValue(bus);
    (require('../../buses/repository/repository').busRepository.update as jest.Mock).mockResolvedValue({});
    mockRepo.create.mockImplementation((data: any) => data);
    mockRepo.save.mockImplementation(async (data: any) => ({ ...data, id: Math.floor(Math.random() * 1000) }));

    for (const ticket of ticketsToCreate) {
      const result = await ticketRepository.create(ticket);
      expect(result).toHaveProperty('id');
      expect(result.booking_id).toBe(ticket.booking_id);
    }
  });

  it('sortSet: should sort an array of numbers ascending', () => {
    const unsorted = [5, 2, 9, 1, 3];
    const sorted = ticketRepository.sortSet([...unsorted]);
    expect(sorted).toEqual([1, 2, 3, 5, 9]);
  });
}); 