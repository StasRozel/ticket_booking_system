import { Test, TestingModule } from '@nestjs/testing';
import { SeatReservationsController } from './seat-reservations.controller';
import { SeatReservationsService } from './seat-reservations.service';

describe('SeatReservationsController', () => {
  let controller: SeatReservationsController;
  let service: SeatReservationsService;

  const mockService = {
    getSeatMap: jest.fn(),
    getUserReservations: jest.fn(),
    reserve: jest.fn(),
    cancelReservation: jest.fn(),
    cancelAllReservations: jest.fn(),
    confirmReservations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeatReservationsController],
      providers: [{ provide: SeatReservationsService, useValue: mockService }],
    }).compile();
    controller = module.get<SeatReservationsController>(SeatReservationsController);
    service = module.get<SeatReservationsService>(SeatReservationsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('getSeatMap', async () => {
    mockService.getSeatMap.mockResolvedValue({ seats: [] });
    expect(await controller.getSeatMap('1')).toEqual({ seats: [] });
    expect(mockService.getSeatMap).toHaveBeenCalledWith(1);
  });

  it('getUserReservations', async () => {
    mockService.getUserReservations.mockResolvedValue([{ id: 1 }]);
    expect(await controller.getUserReservations('1', '2')).toEqual([{ id: 1 }]);
    expect(mockService.getUserReservations).toHaveBeenCalledWith(1, 2);
  });

  it('getUserReservations without busScheduleId', async () => {
    mockService.getUserReservations.mockResolvedValue([{ id: 1 }]);
    expect(await controller.getUserReservations('1')).toEqual([{ id: 1 }]);
    expect(mockService.getUserReservations).toHaveBeenCalledWith(1, undefined);
  });

  it('reserve', async () => {
    mockService.reserve.mockResolvedValue({ id: 1 });
    expect(await controller.reserve({} as any)).toEqual({ id: 1 });
  });

  it('cancelReservation', async () => {
    mockService.cancelReservation.mockResolvedValue({ success: true });
    expect(await controller.cancelReservation('1', { user_id: 1 })).toEqual({ success: true });
    expect(mockService.cancelReservation).toHaveBeenCalledWith(1, 1);
  });

  it('cancelAllReservations', async () => {
    mockService.cancelAllReservations.mockResolvedValue({ success: true });
    expect(await controller.cancelAllReservations('1', { user_id: 1 })).toEqual({ success: true });
    expect(mockService.cancelAllReservations).toHaveBeenCalledWith(1, 1);
  });

  it('confirmReservations', async () => {
    mockService.confirmReservations.mockResolvedValue({ booking: {}, tickets: [] });
    expect(
      await controller.confirmReservations({
        user_id: 1,
        bus_schedule_id: 1,
        boarding_point: 'A',
      }),
    ).toEqual({ booking: {}, tickets: [] });
    expect(mockService.confirmReservations).toHaveBeenCalledWith(1, 1, 'A');
  });
});
