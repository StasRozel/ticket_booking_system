import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService | null = null;

  const mockService = {
    register: jest.fn(),
    notifyArrival: jest.fn(),
    notifyArrivalForSchedule: jest.fn(),
    notifyDelay: jest.fn(),
    notifyDelayForSchedule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockService }],
    }).compile();
    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('register', async () => {
    mockService.register.mockResolvedValue({ success: true });
    expect(await controller.register({ userId: 1, chatId: 'c1' })).toEqual({
      success: true,
    });
    expect(mockService.register).toHaveBeenCalledWith({
      userId: 1,
      chatId: 'c1',
    });
  });

  it('notifyArrival', async () => {
    mockService.notifyArrival.mockResolvedValue({ success: true });
    const data = { userId: 1, routeName: 'R1', stopName: 'S1' };
    expect(await controller.notifyArrival(data)).toEqual({ success: true });
    expect(mockService.notifyArrival).toHaveBeenCalledWith(data);
  });

  it('notifyArrivalForSchedule', async () => {
    mockService.notifyArrivalForSchedule.mockResolvedValue({
      success: true,
      results: [],
    });
    const data = { bus_schedule_id: 1, stopName: 'S1' };
    expect(await controller.notifyArrivalForSchedule(data)).toEqual({
      success: true,
      results: [],
    });
    expect(mockService.notifyArrivalForSchedule).toHaveBeenCalledWith(data);
  });

  it('notifyDelay', async () => {
    mockService.notifyDelay.mockResolvedValue({ success: true });
    const data = { userId: 1, routeName: 'R1', minutes: 10 };
    expect(await controller.notifyDelay(data)).toEqual({ success: true });
    expect(mockService.notifyDelay).toHaveBeenCalledWith(data);
  });

  it('notifyDelayForSchedule', async () => {
    mockService.notifyDelayForSchedule.mockResolvedValue({
      success: true,
      results: [],
    });
    const data = { bus_schedule_id: 1, minutes: 10 };
    expect(await controller.notifyDelayForSchedule(data)).toEqual({
      success: true,
      results: [],
    });
    expect(mockService.notifyDelayForSchedule).toHaveBeenCalledWith(data);
  });
});
