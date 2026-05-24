import { Test, TestingModule } from '@nestjs/testing';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';

describe('DriversController', () => {
  let controller: DriversController;
  let service: DriversService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findOneByUserId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriversController],
      providers: [{ provide: DriversService, useValue: mockService }],
    }).compile();
    controller = module.get<DriversController>(DriversController);
    service = module.get<DriversService>(DriversService);
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

  it('getDriverByUserId', async () => {
    mockService.findOneByUserId.mockResolvedValue({ id: 1 });
    const result = await controller.getDriverByUserId(5 as any);
    expect(result).toEqual({ id: 1 });
    expect(mockService.findOneByUserId).toHaveBeenCalledWith(5);
  });

  it('findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: 1 });
    expect(await controller.findOne('1')).toEqual({ id: 1 });
    expect(mockService.findOne).toHaveBeenCalledWith(1);
  });

  it('update', async () => {
    mockService.update.mockResolvedValue({ id: 1 });
    expect(await controller.update('1', {} as any)).toEqual({ id: 1 });
    expect(mockService.update).toHaveBeenCalledWith(1, {});
  });

  it('remove', async () => {
    mockService.remove.mockResolvedValue(true);
    expect(await controller.remove('1')).toBe(true);
    expect(mockService.remove).toHaveBeenCalledWith(1);
  });
});
