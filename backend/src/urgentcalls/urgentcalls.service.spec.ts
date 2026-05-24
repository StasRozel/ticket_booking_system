import { Test, TestingModule } from '@nestjs/testing';
import { UrgentcallsService } from './urgentcalls.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Urgentcall } from './entities/urgentcall.entity';
import { BusSchedule } from 'src/busschedules/entities/busschedule.entity';

describe('UrgentcallsService', () => {
  let service: UrgentcallsService;

  const mockUrgentCallRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockBusScheduleRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrgentcallsService,
        { provide: getRepositoryToken(Urgentcall), useValue: mockUrgentCallRepository },
        { provide: getRepositoryToken(BusSchedule), useValue: mockBusScheduleRepository },
      ],
    }).compile();
    service = module.get<UrgentcallsService>(UrgentcallsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should return error if busScheduleId missing', async () => {
      const result = await service.create({} as any);
      expect(result).toEqual({ success: false, message: 'busScheduleId is required' });
    });

    it('should return error if driverId missing', async () => {
      const result = await service.create({ busScheduleId: 1 } as any);
      expect(result).toEqual({ success: false, message: 'driverId is required' });
    });

    it('should return error if busSchedule not found', async () => {
      mockBusScheduleRepository.findOneBy.mockResolvedValue(null);
      const result = await service.create({ busScheduleId: 1, driverId: 1 } as any);
      expect(result).toEqual({
        success: false,
        error: 'BusSchedule 1 not found',
      });
    });

    it('should create and save urgent call', async () => {
      mockBusScheduleRepository.findOneBy.mockResolvedValue({ id: 1 });
      const created = { busScheduleId: 1, driverId: 1 };
      mockUrgentCallRepository.create.mockReturnValue(created);
      mockUrgentCallRepository.save.mockResolvedValue({ id: 1, ...created });

      const result = await service.create({ busScheduleId: 1, driverId: 1 } as any);
      expect(result).toEqual({ success: true, data: created });
      expect(mockUrgentCallRepository.save).toHaveBeenCalledWith(created);
    });

    it('should handle repository errors', async () => {
      mockBusScheduleRepository.findOneBy.mockResolvedValue({ id: 1 });
      jest.spyOn(mockUrgentCallRepository, 'create').mockImplementation(() => {
        throw new Error('DB error');
      });
      const result = await service.create({ busScheduleId: 1, driverId: 1 } as any);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create urgent call');
    });
  });

  describe('findAll', () => {
    it('should return all urgent calls', async () => {
      mockUrgentCallRepository.find.mockResolvedValue([{ id: 1 }]);
      expect(await service.findAll()).toEqual([{ id: 1 }]);
    });
  });

  describe('findOne', () => {
    it('should return by id', async () => {
      mockUrgentCallRepository.findOneBy.mockResolvedValue({ id: 1 });
      expect(await service.findOne(1)).toEqual({ id: 1 });
    });
  });

  describe('update', () => {
    it('should return null if not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);
      expect(await service.update(1, {} as any)).toBeNull();
    });

    it('should update and return', async () => {
      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce({ id: 1, status: 'pending' } as any)
        .mockResolvedValueOnce({ id: 1, status: 'resolved' } as any);
      mockUrgentCallRepository.update.mockResolvedValue(undefined);
      expect(await service.update(1, { status: 'resolved' } as any)).toEqual({
        id: 1,
        status: 'resolved',
      });
    });
  });

  describe('remove', () => {
    it('should return true if deleted', async () => {
      mockUrgentCallRepository.delete.mockResolvedValue({ affected: 1 });
      expect(await service.remove(1)).toBe(true);
    });

    it('should return false if not found', async () => {
      mockUrgentCallRepository.delete.mockResolvedValue({ affected: 0 });
      expect(await service.remove(1)).toBe(false);
    });
  });
});
