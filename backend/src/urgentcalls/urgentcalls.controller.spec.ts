import { Test, TestingModule } from '@nestjs/testing';
import { UrgentcallsController } from './urgentcalls.controller';
import { UrgentcallsService } from './urgentcalls.service';

describe('UrgentcallsController', () => {
  let controller: UrgentcallsController;
  let service: UrgentcallsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrgentcallsController],
      providers: [{ provide: UrgentcallsService, useValue: mockService }],
    }).compile();
    controller = module.get<UrgentcallsController>(UrgentcallsController);
    service = module.get<UrgentcallsService>(UrgentcallsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create delegates to service', async () => {
    mockService.create.mockResolvedValue({ success: true });
    expect(await controller.create({} as any)).toEqual({ success: true });
  });

  it('findAll delegates to service', async () => {
    mockService.findAll.mockResolvedValue([{ id: 1 }]);
    expect(await controller.findAll()).toEqual([{ id: 1 }]);
  });

  it('findOne delegates to service with number', async () => {
    mockService.findOne.mockResolvedValue({ id: 1 });
    expect(await controller.findOne('1')).toEqual({ id: 1 });
    expect(mockService.findOne).toHaveBeenCalledWith(1);
  });

  it('update delegates to service', async () => {
    mockService.update.mockResolvedValue({ id: 1 });
    expect(await controller.update('1', {} as any)).toEqual({ id: 1 });
    expect(mockService.update).toHaveBeenCalledWith(1, {});
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue(true);
    expect(await controller.remove('1')).toBe(true);
    expect(mockService.remove).toHaveBeenCalledWith(1);
  });
});
