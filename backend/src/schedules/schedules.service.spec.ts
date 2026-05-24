import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesService } from './schedules.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { Route } from 'src/routes/entities/route.entity';
import { BusSchedule } from 'src/busschedules/entities/busschedule.entity';

describe('SchedulesService', () => {
  let service: SchedulesService;

  const mockScheduleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockRouteRepository = {
    findOneBy: jest.fn(),
  };
  const mockBusScheduleRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulesService,
        { provide: getRepositoryToken(Schedule), useValue: mockScheduleRepository },
        { provide: getRepositoryToken(Route), useValue: mockRouteRepository },
        { provide: getRepositoryToken(BusSchedule), useValue: mockBusScheduleRepository },
      ],
    }).compile();
    service = module.get<SchedulesService>(SchedulesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should return error if route not found', async () => {
      mockRouteRepository.findOneBy.mockResolvedValue(null);
      const result = await service.create({ route_id: 1 } as any);
      expect(result).toEqual({
        success: false,
        error: 'Маршрут с ID 1 не существует',
      });
    });

    it('should create schedule successfully', async () => {
      mockRouteRepository.findOneBy.mockResolvedValue({ id: 1 });
      const created = { route_id: 1, departure_time: '08:00' };
      mockScheduleRepository.create.mockReturnValue(created);
      const result = await service.create({ route_id: 1, departure_time: '08:00' } as any);
      expect(result).toEqual({ success: true, data: created });
    });

    it('should handle errors during creation', async () => {
      mockRouteRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockScheduleRepository.create.mockImplementation(() => {
        throw new Error('create failed');
      });
      const result = await service.create({ route_id: 1 } as any);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Ошибка при создании расписания');
    });
  });

  describe('validateScheduleData', () => {
    it('should return error if busSchedule not found', async () => {
      mockRouteRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockBusScheduleRepository.findOneBy.mockResolvedValue(null);
      const result = await service.validateScheduleData({
        route_id: 1,
        busSchedules: [{ id: 99 } as any],
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Расписание автобуса с ID 99 не существует');
    });
  });

  describe('findAll', () => {
    it('should return schedules with route relations', async () => {
      mockScheduleRepository.find.mockResolvedValue([{ id: 1, route: { id: 1 } }]);
      expect(await service.findAll()).toEqual([{ id: 1, route: { id: 1 } }]);
      expect(mockScheduleRepository.find).toHaveBeenCalledWith({ relations: ['route'] });
    });
  });

  describe('findOne', () => {
    it('should return schedule with route relation', async () => {
      mockScheduleRepository.findOne.mockResolvedValue({ id: 1 });
      expect(await service.findOne(1)).toEqual({ id: 1 });
      expect(mockScheduleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['route'],
      });
    });
  });

  describe('update', () => {
    it('should return error if validation fails', async () => {
      mockRouteRepository.findOneBy.mockResolvedValue(null);
      const result = await service.update(1, { route_id: 99 } as any);
      expect(result.success).toBe(false);
    });

    it('should update and return schedule', async () => {
      mockRouteRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockScheduleRepository.update.mockResolvedValue(undefined);
      mockScheduleRepository.findOne.mockResolvedValue({ id: 1, route_id: 1 });

      const result = await service.update(1, { route_id: 1 } as any);
      expect(result).toEqual({ success: true, data: { id: 1, route_id: 1 } });
    });

    it('should return not found message', async () => {
      mockRouteRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockScheduleRepository.update.mockResolvedValue(undefined);
      mockScheduleRepository.findOne.mockResolvedValue(null);

      const result = await service.update(1, { route_id: 1 } as any);
      expect(result).toEqual({ success: false, message: 'Расписание не найдено' });
    });

    it('should handle update errors', async () => {
      mockRouteRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockScheduleRepository.update.mockImplementation(() => {
        throw new Error('update failed');
      });
      const result = await service.update(1, { route_id: 1 } as any);
      expect(result.success).toBe(false);
    });
  });

  describe('remove', () => {
    it('should return true if deleted', async () => {
      mockScheduleRepository.delete.mockResolvedValue({ affected: 1 });
      expect(await service.remove(1)).toBe(true);
    });
  });

  describe('deleteByRouteId', () => {
    it('should delete schedules by route', async () => {
      mockScheduleRepository.delete.mockResolvedValue({ affected: 2 });
      expect(await service.deleteByRouteId(1)).toBe(true);
      expect(mockScheduleRepository.delete).toHaveBeenCalledWith({
        route: { id: 1 },
      });
    });
  });
});
