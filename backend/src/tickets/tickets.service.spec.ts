import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { BusSchedule } from 'src/busschedules/entities/busschedule.entity';
import { Bus } from 'src/buses/entities/bus.entity';
import { SeatReservation } from 'src/seat-reservations/entities/seat-reservation.entity';

describe('TicketsService', () => {
  let service: TicketsService;

  const mockTicketRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    findBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockBookingRepository = {
    findOneBy: jest.fn(),
  };
  const mockBusScheduleRepository = {
    findOneBy: jest.fn(),
  };
  const mockBusRepository = {
    findOneBy: jest.fn(),
    update: jest.fn(),
  };
  const mockSeatReservationRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: getRepositoryToken(Ticket), useValue: mockTicketRepository },
        { provide: getRepositoryToken(Booking), useValue: mockBookingRepository },
        { provide: getRepositoryToken(BusSchedule), useValue: mockBusScheduleRepository },
        { provide: getRepositoryToken(Bus), useValue: mockBusRepository },
        { provide: getRepositoryToken(SeatReservation), useValue: mockSeatReservationRepository },
      ],
    }).compile();
    service = module.get<TicketsService>(TicketsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should return null if booking not found', async () => {
      mockBookingRepository.findOneBy.mockResolvedValue(null);
      expect(await service.create({ booking_id: 1 } as any)).toBeNull();
    });

    it('should return null if busSchedule not found', async () => {
      mockBookingRepository.findOneBy.mockResolvedValue({ id: 1, bus_schedule_id: 1 });
      mockBusScheduleRepository.findOneBy.mockResolvedValue(null);
      expect(await service.create({ booking_id: 1 } as any)).toBeNull();
    });

    it('should throw if no available seats', async () => {
      mockBookingRepository.findOneBy.mockResolvedValue({ id: 1, bus_schedule_id: 1 });
      mockBusScheduleRepository.findOneBy.mockResolvedValue({ id: 1, bus_id: 1 });
      mockBusRepository.findOneBy.mockResolvedValue({ id: 1, capacity: [] });
      await expect(service.create({ booking_id: 1 } as any)).rejects.toThrow('No available seats');
    });

    it('should create ticket with first available seat', async () => {
      mockBookingRepository.findOneBy.mockResolvedValue({ id: 1, bus_schedule_id: 1 });
      mockBusScheduleRepository.findOneBy.mockResolvedValue({ id: 1, bus_id: 1 });
      mockBusRepository.findOneBy.mockResolvedValue({ id: 1, capacity: [3, 1, 2] });
      mockTicketRepository.create.mockReturnValue({ booking_id: 1, seat_number: 1 });
      mockTicketRepository.save.mockResolvedValue({ id: 1, booking_id: 1, seat_number: 1 });
      mockBusRepository.update.mockResolvedValue(undefined);

      const result = await service.create({ booking_id: 1 } as any);
      expect(result).toEqual({ id: 1, booking_id: 1, seat_number: 1 });
      expect(mockTicketRepository.create).toHaveBeenCalledWith({
        booking_id: 1,
        seat_number: 1,
      });
      expect(mockBusRepository.update).toHaveBeenCalledWith(1, { capacity: [2, 3] });
    });
  });

  describe('findAll', () => {
    it('should return all tickets', async () => {
      mockTicketRepository.find.mockResolvedValue([{ id: 1 }]);
      expect(await service.findAll()).toEqual([{ id: 1 }]);
    });
  });

  describe('findOne', () => {
    it('should return ticket by id', async () => {
      mockTicketRepository.findOneBy.mockResolvedValue({ id: 1 });
      expect(await service.findOne(1)).toEqual({ id: 1 });
    });
  });

  describe('findByBookingId', () => {
    it('should return tickets by booking_id', async () => {
      mockTicketRepository.findBy.mockResolvedValue([{ id: 1, booking_id: 1 }]);
      expect(await service.findByBookingId(1)).toEqual([{ id: 1, booking_id: 1 }]);
    });
  });

  describe('update', () => {
    it('should return null if ticket not found', async () => {
      mockTicketRepository.findOneBy.mockResolvedValue(null);
      expect(await service.update(1, {} as any)).toBeNull();
    });

    it('should set price to 0 for child', async () => {
      mockTicketRepository.findOneBy
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 1, is_child: true, price: 0 });
      mockTicketRepository.update.mockResolvedValue(undefined);
      const result = await service.update(1, { is_child: true } as any);
      expect(mockTicketRepository.update).toHaveBeenCalledWith(1, {
        is_child: true,
        price: 0,
      });
      expect(result).toEqual({ id: 1, is_child: true, price: 0 });
    });
  });

  describe('cansel', () => {
    it('should return null if booking not found', async () => {
      mockBookingRepository.findOneBy.mockResolvedValue(null);
      expect(await service.cansel(1, { booking_id: 1 } as any)).toBeNull();
    });

    it('should cancel and restore seat capacity', async () => {
      mockBookingRepository.findOneBy.mockResolvedValue({ id: 1, bus_schedule_id: 1 });
      mockBusScheduleRepository.findOneBy.mockResolvedValue({ id: 1, bus_id: 1 });
      mockBusRepository.findOneBy.mockResolvedValue({ id: 1, capacity: [1, 2] });
      mockTicketRepository.delete.mockResolvedValue({ affected: 1 });
      mockTicketRepository.findOneBy.mockResolvedValue(undefined);

      const result = await service.cansel(1, { booking_id: 1, seat_number: 3 } as any);
      expect(mockBusRepository.update).toHaveBeenCalledWith(1, { capacity: [1, 2, 3] });
      expect(result).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should return placeholder string', () => {
      expect(service.remove(1)).toBe('This action removes a #1 ticket');
    });
  });
});
