import { Test, TestingModule } from '@nestjs/testing';
import { BusschedulesController } from './busschedules.controller';
import { BusschedulesService } from './busschedules.service';

describe('BusschedulesController', () => {
  let controller: BusschedulesController;
  let service: BusschedulesService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByDate: jest.fn(),
    findOneByBusId: jest.fn(),
    update: jest.fn(),
    addVisitedStop: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusschedulesController],
      providers: [{ provide: BusschedulesService, useValue: mockService }],
    }).compile();
    controller = module.get<BusschedulesController>(BusschedulesController);
    service = module.get<BusschedulesService>(BusschedulesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create', async () => {
    mockService.create.mockResolvedValue({ id: 1 });
    expect(await controller.create({} as any)).toEqual({ id: 1 });
  });

  it('findAll', async () => {
    mockService.findAll.mockResolvedValue([{ id: 1 }]);
    expect(await controller.findAll()).toEqual([{ id: 1 }]);
  });

  it('findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: 1 });
    expect(await controller.findOne('1')).toEqual({ id: 1 });
    expect(mockService.findOne).toHaveBeenCalledWith(1);
  });

  it('findByDate', async () => {
    mockService.findByDate.mockResolvedValue([{ id: 1 }]);
    expect(await controller.findByDate('2026-05-17')).toEqual([{ id: 1 }]);
    expect(mockService.findByDate).toHaveBeenCalledWith('2026-05-17');
  });

  it('getBusByBusId', async () => {
    mockService.findOneByBusId.mockResolvedValue([{ id: 1 }]);
    expect(await controller.getBusByBusId(1 as any)).toEqual([{ id: 1 }]);
    expect(mockService.findOneByBusId).toHaveBeenCalledWith(1);
  });

  it('update', async () => {
    mockService.update.mockResolvedValue({ id: 1 });
    expect(await controller.update('1', {} as any)).toEqual({ id: 1 });
    expect(mockService.update).toHaveBeenCalledWith(1, {});
  });

  it('update with invalid id', async () => {
    const result = await controller.update('abc', {} as any);
    expect(result).toEqual({ success: false, error: 'Invalid id' });
  });

  it('visitStop', async () => {
    mockService.addVisitedStop.mockResolvedValue({ id: 1, visited_stops: [5] });
    expect(await controller.visitStop(1 as any, { stopId: 5 })).toEqual({ id: 1, visited_stops: [5] });
    expect(mockService.addVisitedStop).toHaveBeenCalledWith(1, 5);
  });

  it('remove', async () => {
    mockService.remove.mockResolvedValue(true);
    expect(await controller.remove('1')).toBe(true);
    expect(mockService.remove).toHaveBeenCalledWith(1);
  });
});
