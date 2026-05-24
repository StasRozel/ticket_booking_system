import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

describe('BookingsController', () => {
  let controller: BookingsController;

  const mockBookingsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getBookingByScheduleId: jest.fn(),
    completeByScheduleId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a booking', async () => {
      const dto = { user_id: 1, bus_schedule_id: 1, status: 'Выбран' };
      mockBookingsService.create.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.create(dto as any);

      expect(result).toEqual({ id: 1, ...dto });
      expect(mockBookingsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all bookings', async () => {
      const bookings = [{ id: 1 }, { id: 2 }];
      mockBookingsService.findAll.mockResolvedValue(bookings);

      const result = await controller.findAll();

      expect(result).toEqual(bookings);
      expect(mockBookingsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a booking by id', async () => {
      const booking = { id: 1 };
      mockBookingsService.findOne.mockResolvedValue(booking);

      const result = await controller.findOne('1');

      expect(result).toEqual(booking);
      expect(mockBookingsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('getBookingByScheduleId', () => {
    it('should return bookings by schedule id', async () => {
      const bookings = [{ id: 1, bus_schedule_id: 1 }];
      mockBookingsService.getBookingByScheduleId.mockResolvedValue(bookings);

      const result = await controller.getBookingByScheduleId(1 as any);

      expect(result).toEqual(bookings);
      expect(mockBookingsService.getBookingByScheduleId).toHaveBeenCalledWith(
        1,
      );
    });
  });

  describe('completeByScheduleId', () => {
    it('should complete bookings and return success', async () => {
      mockBookingsService.completeByScheduleId.mockResolvedValue(undefined);

      const result = await controller.completeByScheduleId(1 as any);

      expect(result).toEqual({ success: true });
      expect(mockBookingsService.completeByScheduleId).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a booking', async () => {
      const dto = { status: 'Подтвержден' };
      mockBookingsService.update.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.update('1', dto as any);

      expect(result).toEqual({ id: 1, ...dto });
      expect(mockBookingsService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a booking', async () => {
      mockBookingsService.remove.mockResolvedValue(true);

      const result = await controller.remove('1');

      expect(result).toBe(true);
      expect(mockBookingsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
