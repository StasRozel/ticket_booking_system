import { Test, TestingModule } from '@nestjs/testing';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';

describe('RoutesController', () => {
  let controller: RoutesController;
  let service: RoutesService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoutesController],
      providers: [{ provide: RoutesService, useValue: mockService }],
    }).compile();
    controller = module.get<RoutesController>(RoutesController);
    service = module.get<RoutesService>(RoutesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should call service.create', async () => {
    mockService.create.mockResolvedValue({ id: 1 });
    expect(await controller.create({} as any)).toEqual({ id: 1 });
  });

  it('should call service.findAll', async () => {
    mockService.findAll.mockResolvedValue([{ id: 1 }]);
    expect(await controller.findAll()).toEqual([{ id: 1 }]);
  });

  it('should call service.findOne with number', async () => {
    mockService.findOne.mockResolvedValue({ id: 1 });
    expect(await controller.findOne('1')).toEqual({ id: 1 });
    expect(mockService.findOne).toHaveBeenCalledWith(1);
  });

  it('should call service.update', async () => {
    mockService.update.mockResolvedValue({ id: 1 });
    expect(await controller.update('1', {} as any)).toEqual({ id: 1 });
    expect(mockService.update).toHaveBeenCalledWith(1, {});
  });

  it('should call service.remove', async () => {
    mockService.remove.mockResolvedValue(true);
    expect(await controller.remove('1')).toBe(true);
    expect(mockService.remove).toHaveBeenCalledWith(1);
  });
});
