import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';

describe('ComplaintsController', () => {
  let controller: ComplaintsController;
  let service: ComplaintsService;

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
      controllers: [ComplaintsController],
      providers: [{ provide: ComplaintsService, useValue: mockService }],
    }).compile();
    controller = module.get<ComplaintsController>(ComplaintsController);
    service = module.get<ComplaintsService>(ComplaintsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should call service.create', async () => {
      mockService.create.mockResolvedValue({ id: 1 });
      expect(await controller.create({} as any)).toEqual({ id: 1 });
    });
  });

  describe('findAll', () => {
    it('should return all', async () => {
      mockService.findAll.mockResolvedValue([{ id: 1 }]);
      expect(await controller.findAll()).toEqual([{ id: 1 }]);
    });
  });

  describe('findOne', () => {
    it('should call with number', async () => {
      mockService.findOne.mockResolvedValue({ id: 1 });
      expect(await controller.findOne('1')).toEqual({ id: 1 });
      expect(mockService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('getDriverByUserId', () => {
    it('should call findOneByUserId', async () => {
      mockService.findOneByUserId.mockResolvedValue({ id: 1, userId: 5 });
      expect(await controller.getDriverByUserId(5 as any)).toEqual({
        id: 1,
        userId: 5,
      });
      expect(mockService.findOneByUserId).toHaveBeenCalledWith(5);
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      mockService.update.mockResolvedValue({ id: 1 });
      expect(await controller.update('1', {} as any)).toEqual({ id: 1 });
      expect(mockService.update).toHaveBeenCalledWith(1, {});
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      mockService.remove.mockResolvedValue(true);
      expect(await controller.remove('1')).toBe(true);
      expect(mockService.remove).toHaveBeenCalledWith(1);
    });
  });
});
