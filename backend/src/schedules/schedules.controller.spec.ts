import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';

describe('SchedulesController', () => {
  let controller: SchedulesController;
  let service: SchedulesService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulesController],
      providers: [{ provide: SchedulesService, useValue: mockService }],
    }).compile();
    controller = module.get<SchedulesController>(SchedulesController);
    service = module.get<SchedulesService>(SchedulesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create', async () => {
    mockService.create.mockResolvedValue({ success: true });
    expect(await controller.create({} as any)).toEqual({ success: true });
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

  it('update', async () => {
    mockService.update.mockResolvedValue({ success: true });
    expect(await controller.update('1', {} as any)).toEqual({ success: true });
    expect(mockService.update).toHaveBeenCalledWith(1, {});
  });

  it('remove', async () => {
    mockService.remove.mockResolvedValue(true);
    expect(await controller.remove('1')).toBe(true);
    expect(mockService.remove).toHaveBeenCalledWith(1);
  });
});
