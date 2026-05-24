import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: TicketsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByBookingId: jest.fn(),
    update: jest.fn(),
    cansel: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [{ provide: TicketsService, useValue: mockService }],
    }).compile();
    controller = module.get<TicketsController>(TicketsController);
    service = module.get<TicketsService>(TicketsService);
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

  it('findByBookingId', async () => {
    mockService.findByBookingId.mockResolvedValue([{ id: 1 }]);
    expect(await controller.findByBookingId('1')).toEqual([{ id: 1 }]);
    expect(mockService.findByBookingId).toHaveBeenCalledWith(1);
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

  it('cansel', async () => {
    mockService.cansel.mockResolvedValue({ success: true });
    expect(await controller.cansel(1 as any, {} as any)).toEqual({ success: true });
    expect(mockService.cansel).toHaveBeenCalledWith(1, {});
  });

  it('remove', async () => {
    mockService.remove.mockResolvedValue('removed');
    expect(await controller.remove('1')).toBe('removed');
    expect(mockService.remove).toHaveBeenCalledWith(1);
  });
});
