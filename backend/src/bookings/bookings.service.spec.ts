import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { SeatReservation } from 'src/seat-reservations/entities/seat-reservation.entity';
import { UpdateBookingDto } from './dto/update-booking.dto';

describe('BookingsService', () => {
  let service: BookingsService;

  const mockBookingRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    findBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockSeatReservationRepository = {
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: getRepositoryToken(SeatReservation),
          useValue: mockSeatReservationRepository,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all bookings', async () => {
      const bookings = [{ id: 1 }, { id: 2 }];
      mockBookingRepository.find.mockResolvedValue(bookings);
      const result = await service.findAll();
      expect(result).toEqual(bookings);
      expect(mockBookingRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a booking by id', async () => {
      const booking = { id: 1 };
      mockBookingRepository.findOneBy.mockResolvedValue(booking);
      const result = await service.findOne(1);
      expect(result).toEqual(booking);
      expect(mockBookingRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('findAllByUserId', () => {
    it('should return bookings for a user with relations', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 1, user_id: 1 }]),
      };
      mockBookingRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.findAllByUserId(1);
      expect(result).toEqual([{ id: 1, user_id: 1 }]);
      expect(mockBookingRepository.createQueryBuilder).toHaveBeenCalledWith(
        'booking',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(4);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ user_id: 1 });
    });
  });

  describe('create', () => {
    it('should return existing booking if already selected', async () => {
      const dto = { user_id: 1, bus_schedule_id: 1, status: 'Выбран' } as any;
      jest.spyOn(service, 'checkByIsSelect').mockResolvedValue(1);
      mockBookingRepository.findOneBy.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);
      expect(result).toEqual({ id: 1, ...dto });
      expect(mockBookingRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should create a new booking if not already selected', async () => {
      const dto = { user_id: 1, bus_schedule_id: 1, status: 'Выбран' } as any;
      jest.spyOn(service, 'checkByIsSelect').mockResolvedValue(0);
      mockBookingRepository.create.mockReturnValue(dto);
      mockBookingRepository.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);
      expect(result).toEqual({ id: 1, ...dto });
      expect(mockBookingRepository.create).toHaveBeenCalledWith(dto);
      expect(mockBookingRepository.save).toHaveBeenCalledWith(dto);
    });
  });

  describe('checkByIsSelect', () => {
    it('should return booking id when a selected booking exists', async () => {
      mockBookingRepository.findBy.mockResolvedValue([{ id: 5 }]);
      const result = await service.checkByIsSelect(1, 1);
      expect(result).toBe(5);
      expect(mockBookingRepository.findBy).toHaveBeenCalledWith({
        user_id: 1,
        bus_schedule_id: 1,
        status: 'Выбран',
      });
    });

    it('should return 0 when no selected booking exists', async () => {
      mockBookingRepository.findBy.mockResolvedValue([]);
      const result = await service.checkByIsSelect(1, 1);
      expect(result).toBe(0);
    });
  });

  describe('update', () => {
    it('should return null if booking not found', async () => {
      mockBookingRepository.findOneBy.mockResolvedValue(null);
      const result = await service.update(1, {
        status: 'Подтвержден',
      } as UpdateBookingDto);
      expect(result).toBeNull();
    });

    it('should delete seat reservations when status is "Отменен"', async () => {
      const booking = { id: 1, user_id: 1, bus_schedule_id: 1 };
      mockBookingRepository.findOneBy
        .mockResolvedValueOnce(booking)
        .mockResolvedValueOnce({ ...booking, status: 'Отменен' });
      mockBookingRepository.update.mockResolvedValue(undefined);
      mockSeatReservationRepository.delete.mockResolvedValue(undefined);

      const result = await service.update(1, { status: 'Отменен' } as any);

      expect(mockSeatReservationRepository.delete).toHaveBeenCalledWith({
        user_id: 1,
        bus_schedule_id: 1,
        status: 'reserved',
      });
      expect(mockBookingRepository.update).toHaveBeenCalledWith(1, {
        status: 'Отменен',
      });
      expect(result).toEqual({
        id: 1,
        user_id: 1,
        bus_schedule_id: 1,
        status: 'Отменен',
      });
    });

    it('should delete seat reservations when status is "истек"', async () => {
      const booking = { id: 1, user_id: 1, bus_schedule_id: 1 };
      mockBookingRepository.findOneBy
        .mockResolvedValueOnce(booking)
        .mockResolvedValueOnce({ ...booking, status: 'истек' });
      mockBookingRepository.update.mockResolvedValue(undefined);
      mockSeatReservationRepository.delete.mockResolvedValue(undefined);

      await service.update(1, { status: 'истек' } as any);

      expect(mockSeatReservationRepository.delete).toHaveBeenCalled();
    });

    it('should not delete seat reservations for other statuses', async () => {
      const booking = { id: 1, user_id: 1, bus_schedule_id: 1 };
      mockBookingRepository.findOneBy
        .mockResolvedValueOnce(booking)
        .mockResolvedValueOnce({ ...booking, status: 'Подтвержден' });
      mockBookingRepository.update.mockResolvedValue(undefined);

      await service.update(1, { status: 'Подтвержден' } as any);

      expect(mockSeatReservationRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('findAllByBusScheduleId', () => {
    it('should return bookings with user and tickets relations', async () => {
      const bookings = [
        { id: 1, bus_schedule_id: 1, user: { id: 1 }, tickets: [] },
      ];
      mockBookingRepository.find.mockResolvedValue(bookings);
      const result = await service.findAllByBusScheduleId(1);
      expect(result).toEqual(bookings);
      expect(mockBookingRepository.find).toHaveBeenCalledWith({
        where: { bus_schedule_id: 1 },
        relations: ['user', 'tickets'],
      });
    });
  });

  describe('getBookingByScheduleId', () => {
    it('should return mapped bookings without sensitive user fields', async () => {
      const bookings = [
        {
          id: 1,
          bus_schedule_id: 1,
          user_id: 1,
          booking_date: new Date(),
          status: 'Выбран',
          boarding_point: 'Point A',
          user: {
            id: 1,
            name: 'John',
            password: 'secret',
            refresh_token: 'token',
          },
          tickets: [{ id: 10, booking_id: 1, seat_number: 5 }],
        },
      ];
      jest
        .spyOn(service, 'findAllByBusScheduleId')
        .mockResolvedValue(bookings as any);

      const result = await service.getBookingByScheduleId(1);

      expect(result).toHaveLength(1);
      expect(result[0].user).not.toHaveProperty('password');
      expect(result[0].user).not.toHaveProperty('refresh_token');
      expect(result[0].tickets).toEqual([{ id: 10, seat_number: 5 }]);
    });

    it('should handle bookings without user', async () => {
      const bookings = [
        {
          id: 1,
          bus_schedule_id: 1,
          user_id: 1,
          booking_date: new Date(),
          status: 'Выбран',
          boarding_point: 'Point A',
          user: null,
          tickets: [],
        },
      ];
      jest
        .spyOn(service, 'findAllByBusScheduleId')
        .mockResolvedValue(bookings as any);

      const result = await service.getBookingByScheduleId(1);
      expect(result[0].user).toEqual({});
    });

    it('should filter tickets by booking_id', async () => {
      const bookings = [
        {
          id: 1,
          bus_schedule_id: 1,
          user_id: 1,
          booking_date: new Date(),
          status: 'Выбран',
          boarding_point: 'Point A',
          user: { id: 1 },
          tickets: [
            { id: 10, booking_id: 1, seat_number: 5 },
            { id: 11, booking_id: 2, seat_number: 6 },
          ],
        },
      ];
      jest
        .spyOn(service, 'findAllByBusScheduleId')
        .mockResolvedValue(bookings as any);

      const result = await service.getBookingByScheduleId(1);
      expect(result[0].tickets).toHaveLength(1);
      expect(result[0].tickets[0].id).toBe(10);
    });
  });

  describe('remove', () => {
    it('should delete seat reservations and the booking', async () => {
      const booking = { id: 1, user_id: 1, bus_schedule_id: 1 };
      mockBookingRepository.findOneBy.mockResolvedValue(booking);
      mockSeatReservationRepository.delete.mockResolvedValue(undefined);
      mockBookingRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result).toBe(true);
      expect(mockSeatReservationRepository.delete).toHaveBeenCalledWith({
        user_id: 1,
        bus_schedule_id: 1,
        status: 'reserved',
      });
      expect(mockBookingRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return false if booking not found', async () => {
      mockBookingRepository.findOneBy.mockResolvedValue(null);
      mockBookingRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.remove(999);

      expect(result).toBe(false);
      expect(mockSeatReservationRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateStatusByUserId', () => {
    it('should update status for all bookings of a user', async () => {
      mockBookingRepository.update.mockResolvedValue(undefined);
      await service.updateStatusByUserId(1, 'истек');
      expect(mockBookingRepository.update).toHaveBeenCalledWith(
        { user_id: 1 },
        { status: 'истек' },
      );
    });
  });

  describe('completeByScheduleId', () => {
    it('should set status to "Завершен" and increment count_trips for each booking user', async () => {
      const bookings = [
        { id: 1, user_id: 1, bus_schedule_id: 1, user: { id: 1 }, tickets: [] },
        { id: 2, user_id: 2, bus_schedule_id: 1, user: { id: 2 }, tickets: [] },
      ];
      mockBookingRepository.find.mockResolvedValue(bookings);
      mockBookingRepository.update.mockResolvedValue(undefined);
      mockBookingRepository.manager = {
        increment: jest.fn().mockResolvedValue(undefined),
      } as any;

      await service.completeByScheduleId(1);

      expect(mockBookingRepository.find).toHaveBeenCalledWith({
        where: { bus_schedule_id: 1 },
        relations: ['user', 'tickets'],
      });
      expect(mockBookingRepository.manager.increment).toHaveBeenCalledTimes(2);
      expect(mockBookingRepository.manager.increment).toHaveBeenCalledWith(
        expect.anything(),
        { id: 1 },
        'count_trips',
        1,
      );
      expect(mockBookingRepository.manager.increment).toHaveBeenCalledWith(
        expect.anything(),
        { id: 2 },
        'count_trips',
        1,
      );
      expect(mockBookingRepository.update).toHaveBeenCalledWith(
        { bus_schedule_id: 1 },
        { status: 'Завершен' },
      );
    });
  });
});
