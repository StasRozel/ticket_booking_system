import { Test, TestingModule } from '@nestjs/testing';
import { DriversService } from './drivers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { BusSchedule } from 'src/busschedules/entities/busschedule.entity';

describe('DriversService', () => {
  let service: DriversService;

  const mockDriverRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockBusScheduleRepository = {
    update: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriversService,
        { provide: getRepositoryToken(Driver), useValue: mockDriverRepository },
        { provide: getRepositoryToken(BusSchedule), useValue: mockBusScheduleRepository },
      ],
    }).compile();
    service = module.get<DriversService>(DriversService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create and save driver', async () => {
      const dto = { name: 'John' };
      mockDriverRepository.create.mockReturnValue(dto);
      mockDriverRepository.save.mockResolvedValue({ id: 1, ...dto });
      expect(await service.create(dto as any)).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('should return all drivers', async () => {
      mockDriverRepository.find.mockResolvedValue([{ id: 1 }]);
      expect(await service.findAll()).toEqual([{ id: 1 }]);
    });
  });

  describe('findOne', () => {
    it('should find with relations', async () => {
      mockDriverRepository.findOne.mockResolvedValue({ id: 1, user: { id: 1 } });
      expect(await service.findOne(1)).toEqual({ id: 1, user: { id: 1 } });
      expect(mockDriverRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
    });
  });

  describe('findOneByUserId', () => {
    it('should find by user_id', async () => {
      mockDriverRepository.findOneBy.mockResolvedValue({ id: 1, user_id: 5 });
      expect(await service.findOneByUserId(5)).toEqual({ id: 1, user_id: 5 });
    });
  });

  describe('update', () => {
    it('should return null if driver not found', async () => {
      mockDriverRepository.findOneBy.mockResolvedValue(null);
      expect(await service.update(1, {} as any)).toBeNull();
    });

    it('should update driver and reassign bus schedule', async () => {
      const existingDriver = { id: 1, bus_id: 10, name: 'Old' };
      mockDriverRepository.findOneBy.mockResolvedValueOnce(existingDriver);
      mockDriverRepository.update.mockResolvedValue(undefined);
      mockDriverRepository.findOneBy.mockResolvedValueOnce({
        ...existingDriver,
        bus_id: 20,
        name: 'Updated',
      });

      const result = await service.update(1, { bus_id: 20, name: 'Updated' } as any);
      expect(mockBusScheduleRepository.update).toHaveBeenCalledWith(
        { bus_id: 10 },
        { bus_id: 20 },
      );
      expect(result).toEqual({ id: 1, bus_id: 20, name: 'Updated' });
    });

    it('should update without reassigning if bus_id unchanged', async () => {
      const existingDriver = { id: 1, bus_id: 10 };
      mockDriverRepository.findOneBy
        .mockResolvedValueOnce(existingDriver)
        .mockResolvedValueOnce({ ...existingDriver, name: 'New' });
      mockDriverRepository.update.mockResolvedValue(undefined);

      await service.update(1, { name: 'New' } as any);
      expect(mockBusScheduleRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should return true if deleted', async () => {
      mockDriverRepository.delete.mockResolvedValue({ affected: 1 });
      expect(await service.remove(1)).toBe(true);
    });

    it('should return false if not found', async () => {
      mockDriverRepository.delete.mockResolvedValue({ affected: 0 });
      expect(await service.remove(1)).toBe(false);
    });
  });
});
