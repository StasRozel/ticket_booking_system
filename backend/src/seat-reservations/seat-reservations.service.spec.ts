import { Test, TestingModule } from '@nestjs/testing';
import { SeatReservationsService } from './seat-reservations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SeatReservation } from './entities/seat-reservation.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { BusSchedule } from '../busschedules/entities/busschedule.entity';

describe('SeatReservationsService', () => {
  let service: SeatReservationsService;

  const mockReservationRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };
  const mockBookingRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockTicketRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const mockBusScheduleRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeatReservationsService,
        { provide: getRepositoryToken(SeatReservation), useValue: mockReservationRepository },
        { provide: getRepositoryToken(Booking), useValue: mockBookingRepository },
        { provide: getRepositoryToken(Ticket), useValue: mockTicketRepository },
        { provide: getRepositoryToken(BusSchedule), useValue: mockBusScheduleRepository },
      ],
    }).compile();
    service = module.get<SeatReservationsService>(SeatReservationsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getSeatMap', () => {
    it('should return null if busSchedule not found', async () => {
      mockBusScheduleRepository.findOne.mockResolvedValue(null);
      expect(await service.getSeatMap(1)).toBeNull();
    });

    it('should build seat map with statuses', async () => {
      const busSchedule = {
        id: 1,
        bus: { bus_number: 'A1', type: 'standard', capacity: [1, 2, 3] },
        schedule: { route: { name: 'R1' }, departure_time: '08:00', arrival_time: '10:00' },
      };
      mockBusScheduleRepository.findOne.mockResolvedValue(busSchedule);
      mockReservationRepository.delete.mockResolvedValue({ affected: 0 });

      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockTicketRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockReservationRepository.find.mockResolvedValue([]);

      const result = await service.getSeatMap(1);
      expect(result).toBeDefined();
      expect(result.totalSeats).toBe(3);
      expect(result.seats).toHaveLength(3);
      expect(result.seats[0].status).toBe('available');
    });

    it('should mark seats as occupied when tickets exist', async () => {
      const busSchedule = {
        id: 1,
        bus: { bus_number: 'A1', type: 'standard', capacity: [1, 2] },
        schedule: { route: {}, departure_time: '', arrival_time: '' },
      };
      mockBusScheduleRepository.findOne.mockResolvedValue(busSchedule);
      mockReservationRepository.delete.mockResolvedValue({ affected: 0 });

      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ seat_number: 1 }]),
      };
      mockTicketRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockReservationRepository.find.mockResolvedValue([]);

      const result = await service.getSeatMap(1);
      expect(result.seats[0].status).toBe('occupied');
      expect(result.seats[1].status).toBe('available');
    });
  });

  describe('reserve', () => {
    it('should return error if busSchedule not found', async () => {
      mockReservationRepository.delete.mockResolvedValue({ affected: 0 });
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };
      mockTicketRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockReservationRepository.count.mockResolvedValue(0);
      mockBusScheduleRepository.findOne.mockResolvedValue(null);
      const result = await service.reserve({ user_id: 1, bus_schedule_id: 1, seat_number: 1 } as any);
      expect(result).toEqual({ error: 'Расписание не найдено' });
    });

    it('should enforce max 5 tickets limit', async () => {
      mockReservationRepository.delete.mockResolvedValue({ affected: 0 });
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5),
      };
      mockTicketRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockReservationRepository.count.mockResolvedValue(0);
      const result = await service.reserve({ user_id: 1, bus_schedule_id: 1, seat_number: 1 } as any);
      expect(result).toEqual({ error: 'Нельзя забронировать больше 5 билетов на один маршрут' });
    });

    it('should return error if seat does not exist on bus', async () => {
      mockReservationRepository.delete.mockResolvedValue({ affected: 0 });
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };
      mockTicketRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockBusScheduleRepository.findOne.mockResolvedValue({
        id: 1,
        bus: { capacity: [1, 2] },
        schedule: {},
      });
      const result = await service.reserve({ user_id: 1, bus_schedule_id: 1, seat_number: 5 } as any);
      expect(result).toEqual({ error: 'Место не существует в данном автобусе' });
    });
  });

  describe('cancelReservation', () => {
    it('should return error if not found', async () => {
      mockReservationRepository.findOne.mockResolvedValue(null);
      expect(await service.cancelReservation(1, 1)).toEqual({ error: 'Резервация не найдена' });
    });

    it('should return error if wrong user', async () => {
      mockReservationRepository.findOne.mockResolvedValue({ id: 1, user_id: 2, status: 'reserved' });
      expect(await service.cancelReservation(1, 1)).toEqual({ error: 'Нет прав для отмены' });
    });

    it('should return error if not active', async () => {
      mockReservationRepository.findOne.mockResolvedValue({ id: 1, user_id: 1, status: 'confirmed' });
      expect(await service.cancelReservation(1, 1)).toEqual({ error: 'Резервация уже не активна' });
    });

    it('should cancel successfully', async () => {
      mockReservationRepository.findOne.mockResolvedValue({ id: 1, user_id: 1, status: 'reserved' });
      mockReservationRepository.remove.mockResolvedValue(undefined);
      expect(await service.cancelReservation(1, 1)).toEqual({ success: true });
    });
  });

  describe('cancelAllReservations', () => {
    it('should delete all reservations', async () => {
      mockReservationRepository.delete.mockResolvedValue({ affected: 2 });
      expect(await service.cancelAllReservations(1, 1)).toEqual({ success: true });
    });
  });

  describe('getUserReservations', () => {
    it('should return user reservations', async () => {
      mockReservationRepository.delete.mockResolvedValue({ affected: 0 });
      mockReservationRepository.find.mockResolvedValue([{ id: 1 }]);
      expect(await service.getUserReservations(1)).toEqual([{ id: 1 }]);
    });
  });

  describe('cleanupExpiredReservations', () => {
    it('should delete expired and return count', async () => {
      mockReservationRepository.delete.mockResolvedValue({ affected: 3 });
      expect(await service.cleanupExpiredReservations()).toBe(3);
    });
  });

  describe('confirmReservations', () => {
    it('should return error if no active reservations', async () => {
      mockReservationRepository.find.mockResolvedValue([]);
      const result = await service.confirmReservations(1, 1, 'Point A');
      expect(result).toEqual({ error: 'Нет активных резерваций для подтверждения' });
    });

    it('should confirm reservations and create booking', async () => {
      const validRes = {
        id: 1,
        user_id: 1,
        bus_schedule_id: 1,
        seat_number: 1,
        expires_at: new Date(Date.now() + 100000),
        status: 'reserved',
        is_child: false,
        price: 100,
        boarding_point: 'Point A',
      };
      mockReservationRepository.find.mockResolvedValue([validRes]);

      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getOne: jest.fn().mockResolvedValue(null),
      };
      mockTicketRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockBookingRepository.findOne.mockResolvedValue(null);
      mockBookingRepository.create.mockReturnValue({ id: 1 });
      mockBookingRepository.save.mockResolvedValue({ id: 1 });
      mockTicketRepository.create.mockReturnValue({ id: 1 });
      mockTicketRepository.save.mockResolvedValue({ id: 1 });
      mockReservationRepository.save.mockResolvedValue({ ...validRes, status: 'confirmed' });
      mockBookingRepository.findOne.mockResolvedValue({
        id: 1,
        user_id: 1,
        bus_schedule_id: 1,
        status: 'Выбран',
      });
      mockTicketRepository.find.mockResolvedValue([{ id: 1, booking_id: 1 }]);

      const result = await service.confirmReservations(1, 1, 'Point A');
      expect(result.booking).toBeDefined();
      expect(result.tickets).toHaveLength(1);
    });
  });
});
