import { Test, TestingModule } from '@nestjs/testing';
import { BusesController } from './buses.controller';
import { BusesService } from './buses.service';

describe('BusesController', () => {
  let controller: BusesController;
  let service: BusesService;

  const mockBusesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusesController],
      providers: [{ provide: BusesService, useValue: mockBusesService }],
    }).compile();
    controller = module.get<BusesController>(BusesController);
    service = module.get<BusesService>(BusesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { capacity: '5' };
      mockBusesService.create.mockResolvedValue({ id: 1 });
      expect(await controller.create(dto as any)).toEqual({ id: 1 });
      expect(mockBusesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all buses', async () => {
      mockBusesService.findAll.mockResolvedValue([{ id: 1 }]);
      expect(await controller.findAll()).toEqual([{ id: 1 }]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with number', async () => {
      mockBusesService.findOne.mockResolvedValue({ id: 1 });
      expect(await controller.findOne('1')).toEqual({ id: 1 });
      expect(mockBusesService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto = { name: 'New' };
      mockBusesService.update.mockResolvedValue({ id: 1 });
      expect(await controller.update('1', dto as any)).toEqual({ id: 1 });
      expect(mockBusesService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      mockBusesService.remove.mockResolvedValue(true);
      expect(await controller.remove('1')).toBe(true);
      expect(mockBusesService.remove).toHaveBeenCalledWith(1);
    });
  });
});
