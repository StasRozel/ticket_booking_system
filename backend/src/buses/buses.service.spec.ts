import { Test, TestingModule } from '@nestjs/testing';
import { BusesService } from './buses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bus } from './entities/bus.entity';

describe('BusesService', () => {
  let service: BusesService;

  const mockBusRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusesService,
        { provide: getRepositoryToken(Bus), useValue: mockBusRepository },
      ],
    }).compile();
    service = module.get<BusesService>(BusesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should expand capacity array and save bus', async () => {
      const dto = { capacity: '5' as any, name: 'Bus1' };
      const createdBus = { capacity: [1, 2, 3, 4, 5], name: 'Bus1' };
      mockBusRepository.create.mockReturnValue(createdBus);
      mockBusRepository.save.mockResolvedValue({ id: 1, ...createdBus });

      const result = await service.create(dto as any);
      expect(result).toEqual({ id: 1, capacity: [1, 2, 3, 4, 5], name: 'Bus1' });
      expect(mockBusRepository.create).toHaveBeenCalledWith(createdBus);
    });
  });

  describe('findAll', () => {
    it('should return all buses', async () => {
      mockBusRepository.find.mockResolvedValue([{ id: 1 }]);
      expect(await service.findAll()).toEqual([{ id: 1 }]);
    });
  });

  describe('findOne', () => {
    it('should return bus by id', async () => {
      mockBusRepository.findOneBy.mockResolvedValue({ id: 1 });
      expect(await service.findOne(1)).toEqual({ id: 1 });
    });
  });

  describe('update', () => {
    it('should return null if bus not found', async () => {
      mockBusRepository.findOneBy.mockResolvedValue(null);
      expect(await service.update(1, {} as any)).toBeNull();
    });

    it('should expand capacity if capacity[1] is -1', async () => {
      const bus = { id: 1, capacity: [1, 2, 3] };
      mockBusRepository.findOneBy
        .mockResolvedValueOnce(bus)
        .mockResolvedValueOnce({ ...bus, capacity: [1, 2, 3, 4, 5] });
      mockBusRepository.update.mockResolvedValue(undefined);

      const result = await service.update(1, { capacity: ['5', -1] } as any);
      expect(mockBusRepository.update).toHaveBeenCalledWith(1, {
        capacity: [1, 2, 3, 4, 5],
      });
      expect(result).toEqual({ id: 1, capacity: [1, 2, 3, 4, 5] });
    });

    it('should update without expanding if capacity[1] is not -1', async () => {
      const bus = { id: 1, capacity: [1, 2] };
      mockBusRepository.findOneBy
        .mockResolvedValueOnce(bus)
        .mockResolvedValueOnce({ ...bus, name: 'Updated' });
      mockBusRepository.update.mockResolvedValue(undefined);

      const result = await service.update(1, { name: 'Updated' } as any);
      expect(result).toEqual({ id: 1, capacity: [1, 2], name: 'Updated' });
    });
  });

  describe('remove', () => {
    it('should return true if deleted', async () => {
      mockBusRepository.delete.mockResolvedValue({ affected: 1 });
      expect(await service.remove(1)).toBe(true);
    });

    it('should return false if not found', async () => {
      mockBusRepository.delete.mockResolvedValue({ affected: 0 });
      expect(await service.remove(1)).toBe(false);
    });
  });
});
