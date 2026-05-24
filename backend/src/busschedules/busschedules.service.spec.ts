import { Test, TestingModule } from '@nestjs/testing';
import { BusschedulesService } from './busschedules.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BusSchedule } from './entities/busschedule.entity';
import { Bus } from 'src/buses/entities/bus.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Urgentcall } from 'src/urgentcalls/entities/urgentcall.entity';
import { SeatReservation } from 'src/seat-reservations/entities/seat-reservation.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Booking } from 'src/bookings/entities/booking.entity';

describe('BusschedulesService', () => {
  let service: BusschedulesService;

  const mockRepository: any = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    findBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
    replaceDriverAndBus: jest.fn(),
    count: jest.fn(),
    getCount: jest.fn(),
  };

  const mockBusRepository = { findOneBy: jest.fn() };
  const mockScheduleRepository = { findOneBy: jest.fn() };
  const mockDriverRepository = { findOneBy: jest.fn() };
  const mockUrgentCallRepository = { update: jest.fn() };
  const mockSeatReservationRepository = { delete: jest.fn(), count: jest.fn() };
  const mockTicketRepository = {
    createQueryBuilder: jest.fn(),
    getCount: jest.fn(),
  };
  const mockBookingRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusschedulesService,
        { provide: getRepositoryToken(BusSchedule), useValue: mockRepository },
        { provide: getRepositoryToken(Bus), useValue: mockBusRepository },
        { provide: getRepositoryToken(Schedule), useValue: mockScheduleRepository },
        { provide: getRepositoryToken(Driver), useValue: mockDriverRepository },
        { provide: getRepositoryToken(Urgentcall), useValue: mockUrgentCallRepository },
        { provide: getRepositoryToken(SeatReservation), useValue: mockSeatReservationRepository },
        { provide: getRepositoryToken(Ticket), useValue: mockTicketRepository },
        { provide: getRepositoryToken(Booking), useValue: mockBookingRepository },
      ],
    }).compile();
    service = module.get<BusschedulesService>(BusschedulesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should return error if schedule_id missing', async () => {
      const result = await service.create({} as any);
      expect(result).toEqual({ success: false, error: 'ID расписания обязательно' });
    });

    it('should return error if bus_id missing', async () => {
      const result = await service.create({ schedule_id: 1 } as any);
      expect(result).toEqual({ success: false, error: 'ID автобуса обязательно' });
    });

    it('should return error if schedule not found', async () => {
      mockScheduleRepository.findOneBy.mockResolvedValue(null);
      const result = await service.create({ schedule_id: 1, bus_id: 1 } as any);
      expect(result).toEqual({ success: false, error: 'Расписание с ID 1 не существует' });
    });

    it('should return error if bus not found', async () => {
      mockScheduleRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockBusRepository.findOneBy.mockResolvedValue(null);
      const result = await service.create({ schedule_id: 1, bus_id: 1 } as any);
      expect(result).toEqual({ success: false, error: 'Автобус с ID 1 не существует' });
    });

    it('should return error if bus unavailable', async () => {
      mockScheduleRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockBusRepository.findOneBy.mockResolvedValue({ id: 1, available: false });
      const result = await service.create({ schedule_id: 1, bus_id: 1 } as any);
      expect(result).toEqual({ success: false, error: 'Автобус с ID 1 недоступен' });
    });

    it('should create and save bus schedule', async () => {
      mockScheduleRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockBusRepository.findOneBy.mockResolvedValue({ id: 1, available: true });
      const dto = { schedule_id: 1, bus_id: 1 } as any;
      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockResolvedValue({ id: 1, ...dto });
      const result = await service.create(dto);
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('should use createQueryBuilder', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 1 }]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQb);
      expect(await service.findAll()).toEqual([{ id: 1 }]);
      expect(mockQb.where).toHaveBeenCalledWith('bus.capacity != :capacity', { capacity: {} });
    });
  });

  describe('findOne', () => {
    it('should use createQueryBuilder with where', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 1 }),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQb);
      expect(await service.findOne(1)).toEqual({ id: 1 });
      expect(mockQb.where).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('findByDate', () => {
    it('should return schedules with available seats', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{
          id: 1,
          bus: { capacity: [1, 2, 3] },
        }]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQb);
      mockSeatReservationRepository.delete.mockResolvedValue({ affected: 0 });
      const mockTicketQb = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      };
      mockTicketRepository.createQueryBuilder.mockReturnValue(mockTicketQb);
      mockSeatReservationRepository.count.mockResolvedValue(1);

      const result = await service.findByDate('2026-05-17');
      expect(result).toHaveLength(1);
      expect((result[0] as any).available_seats).toBe(1);
    });
  });

  describe('findOneByBusId', () => {
    it('should find by bus_id', async () => {
      mockRepository.findBy.mockResolvedValue([{ id: 1, bus_id: 1 }]);
      expect(await service.findOneByBusId(1)).toEqual([{ id: 1, bus_id: 1 }]);
    });
  });

  describe('update', () => {
    it('should return error for invalid id', async () => {
      const result = await service.update(NaN, {} as any);
      expect(result).toEqual({ success: false, error: 'Invalid id' });
    });

    it('should return null if not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      expect(await service.update(1, {} as any)).toBeNull();
    });

    it('should return validation error', async () => {
      mockRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockScheduleRepository.findOneBy.mockResolvedValue(null);
      const result = await service.update(1, { schedule_id: 99, bus_id: 1 } as any);
      expect(result).toEqual({ success: false, error: 'Расписание с ID 99 не существует' });
    });

    it('should update and return', async () => {
      mockRepository.findOneBy
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 1, bus_id: 2 });
      mockScheduleRepository.findOneBy.mockResolvedValue({ id: 99 });
      mockBusRepository.findOneBy.mockResolvedValue({ id: 1, available: true });
      mockRepository.update.mockResolvedValue(undefined);
      const result = await service.update(1, { schedule_id: 99, bus_id: 1 } as any);
      expect(result).toEqual({ id: 1, bus_id: 2 });
    });

    it('should update validation fails if bus not available', async () => {
      mockRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockScheduleRepository.findOneBy.mockResolvedValue({ id: 99 });
      mockBusRepository.findOneBy.mockResolvedValue({ id: 1, available: false });
      const result = await service.update(1, { schedule_id: 99, bus_id: 1 } as any);
      expect(result).toEqual({ success: false, error: 'Автобус с ID 1 недоступен' });
    });
  });

  describe('addVisitedStop', () => {
    it('should return null if not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      expect(await service.addVisitedStop(1, 5)).toBeNull();
    });

    it('should add stop if not already visited', async () => {
      mockRepository.findOneBy
        .mockResolvedValueOnce({ id: 1, visited_stops: [1, 2] })
        .mockResolvedValueOnce({ id: 1, visited_stops: [1, 2, 5] });
      mockRepository.update.mockResolvedValue(undefined);
      const result = await service.addVisitedStop(1, 5);
      expect(mockRepository.update).toHaveBeenCalledWith(1, { visited_stops: [1, 2, 5] });
      expect(result).toEqual({ id: 1, visited_stops: [1, 2, 5] });
    });

    it('should not add duplicate stop', async () => {
      mockRepository.findOneBy
        .mockResolvedValueOnce({ id: 1, visited_stops: [1, 2] })
        .mockResolvedValueOnce({ id: 1, visited_stops: [1, 2] });
      const result = await service.addVisitedStop(1, 2);
      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 1, visited_stops: [1, 2] });
    });
  });

  describe('replaceDriverAndBus', () => {
    it('should return error if no driver_id or urgent_call_id', async () => {
      const result = await service.replaceDriverAndBus(1);
      expect(result).toEqual({ success: false });
    });

    it('should return error if driver not found', async () => {
      mockDriverRepository.findOneBy.mockResolvedValue(null);
      const result = await service.replaceDriverAndBus(1, 5, 10);
      expect(result).toEqual({ success: false, error: 'Водитель с ID 5 не найден' });
    });

    it('should replace driver and bus successfully', async () => {
      mockDriverRepository.findOneBy.mockResolvedValue({ id: 5, bus_id: 20 });
      mockRepository.replaceDriverAndBus.mockResolvedValue({ id: 1, bus_id: 20 });
      mockUrgentCallRepository.update.mockResolvedValue(undefined);

      const result = await service.replaceDriverAndBus(1, 5, 10);
      expect(result).toEqual({ success: true, busSchedule: { id: 1, bus_id: 20 } });
      expect(mockUrgentCallRepository.update).toHaveBeenCalledWith(10, {
        driverId: 5,
        accepted: true,
      });
    });

    it('should handle errors', async () => {
      mockDriverRepository.findOneBy.mockRejectedValue(new Error('DB error'));
      const result = await service.replaceDriverAndBus(1, 5, 10);
      expect(result.success).toBe(false);
    });
  });

  describe('remove', () => {
    it('should return true if deleted', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      expect(await service.remove(1)).toBe(true);
    });

    it('should return false if not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });
      expect(await service.remove(1)).toBe(false);
    });
  });
});
