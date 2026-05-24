import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { TelegramService } from './telegram.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    findOneById: jest.fn(),
    update: jest.fn(),
  };
  const mockBookingRepository = {
    find: jest.fn(),
  };
  const mockTelegramService = {
    sendTelegramMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Booking), useValue: mockBookingRepository },
        { provide: TelegramService, useValue: mockTelegramService },
      ],
    }).compile();
    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      await expect(service.register({ userId: 1, chatId: 'chat1' })).rejects.toThrow(NotFoundException);
    });

    it('should update telegram_chat_id', async () => {
      mockUserRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockUserRepository.update.mockResolvedValue(undefined);
      const result = await service.register({ userId: 1, chatId: 'chat1' });
      expect(result).toEqual({ success: true });
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        telegram_chat_id: 'chat1',
      });
    });
  });

  describe('notifyArrival', () => {
    it('should throw if no chatId or userId', async () => {
      await expect(service.notifyArrival({ routeName: 'R1', stopName: 'S1' } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if userId given but user missing', async () => {
      mockUserRepository.findOneById.mockResolvedValue(null);
      await expect(
        service.notifyArrival({ userId: 1, routeName: 'R1', stopName: 'S1' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should send message via telegram', async () => {
      mockUserRepository.findOneById.mockResolvedValue({ telegram_id: 'chat1' });
      mockTelegramService.sendTelegramMessage.mockResolvedValue(undefined);
      const result = await service.notifyArrival({
        userId: 1,
        routeName: 'Route 1',
        stopName: 'Stop A',
      } as any);
      expect(result).toEqual({ success: true });
      expect(mockTelegramService.sendTelegramMessage).toHaveBeenCalledWith(
        'chat1',
        expect.stringContaining('Route 1'),
      );
    });

    it('should use provided chatId', async () => {
      mockTelegramService.sendTelegramMessage.mockResolvedValue(undefined);
      await service.notifyArrival({
        chatId: 'chat1',
        routeName: 'R1',
        stopName: 'S1',
      } as any);
      expect(mockTelegramService.sendTelegramMessage).toHaveBeenCalledWith(
        'chat1',
        expect.any(String),
      );
    });
  });

  describe('notifyArrivalForSchedule', () => {
    it('should throw if no bus_schedule_id', async () => {
      await expect(service.notifyArrivalForSchedule({} as any)).rejects.toThrow('bus_schedule_id required');
    });

    it('should send to all booked users', async () => {
      mockBookingRepository.find.mockResolvedValue([
        { id: 1, user: { telegram_id: 'chat1' } },
        { id: 2, user: null },
      ] as any);
      mockTelegramService.sendTelegramMessage.mockResolvedValue(undefined);

      const result = await service.notifyArrivalForSchedule({
        bus_schedule_id: 1,
        stopName: 'Stop',
      } as any);
      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].sent).toBe(true);
      expect(result.results[1].sent).toBe(false);
    });

    it('should handle telegram send errors', async () => {
      mockBookingRepository.find.mockResolvedValue([
        { id: 1, user: { telegram_id: 'chat1' } },
      ] as any);
      mockTelegramService.sendTelegramMessage.mockRejectedValue(new Error('Telegram down'));

      const result = await service.notifyArrivalForSchedule({
        bus_schedule_id: 1,
        stopName: 'Stop',
      } as any);
      expect(result.results[0].sent).toBe(false);
      expect(result.results[0].reason).toBe('Telegram down');
    });
  });

  describe('notifyDelay', () => {
    it('should throw if no identifier', async () => {
      await expect(
        service.notifyDelay({ routeName: 'R1', minutes: 10 } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should send delay message with correct minutes word', async () => {
      mockTelegramService.sendTelegramMessage.mockResolvedValue(undefined);
      await service.notifyDelay({
        chatId: 'chat1',
        routeName: 'R1',
        minutes: 1,
      } as any);
      expect(mockTelegramService.sendTelegramMessage).toHaveBeenCalledWith(
        'chat1',
        expect.stringContaining('1 минуту'),
      );
    });

    it('should include reason if provided', async () => {
      mockTelegramService.sendTelegramMessage.mockResolvedValue(undefined);
      await service.notifyDelay({
        chatId: 'chat1',
        routeName: 'R1',
        minutes: 5,
        reason: 'Traffic',
      } as any);
      expect(mockTelegramService.sendTelegramMessage).toHaveBeenCalledWith(
        'chat1',
        expect.stringContaining('Traffic'),
      );
    });
  });

  describe('notifyDelayForSchedule', () => {
    it('should throw if no bus_schedule_id', async () => {
      await expect(service.notifyDelayForSchedule({} as any)).rejects.toThrow('bus_schedule_id required');
    });

    it('should notify all bookings about delay', async () => {
      mockBookingRepository.find.mockResolvedValue([
        { id: 1, user: { telegram_id: 'chat1' } },
      ] as any);
      mockTelegramService.sendTelegramMessage.mockResolvedValue(undefined);
      const result = await service.notifyDelayForSchedule({
        bus_schedule_id: 1,
        minutes: 15,
      } as any);
      expect(result.success).toBe(true);
      expect(result.results[0].sent).toBe(true);
    });
  });
});
