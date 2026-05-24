import { Test, TestingModule } from '@nestjs/testing';
import { RoutesService } from './routes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';

describe('RoutesService', () => {
  let service: RoutesService;

  const mockRouteRepository = {
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
        RoutesService,
        { provide: getRepositoryToken(Route), useValue: mockRouteRepository },
      ],
    }).compile();
    service = module.get<RoutesService>(RoutesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create and save a route', async () => {
      const dto = { name: 'Route 1' };
      mockRouteRepository.create.mockReturnValue(dto);
      mockRouteRepository.save.mockResolvedValue({ id: 1, ...dto });
      expect(await service.create(dto as any)).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('should return all routes', async () => {
      mockRouteRepository.find.mockResolvedValue([{ id: 1 }]);
      expect(await service.findAll()).toEqual([{ id: 1 }]);
    });
  });

  describe('findOne', () => {
    it('should return route by id', async () => {
      mockRouteRepository.findOneBy.mockResolvedValue({ id: 1 });
      expect(await service.findOne(1)).toEqual({ id: 1 });
    });
  });

  describe('update', () => {
    it('should return null if not found', async () => {
      mockRouteRepository.findOneBy.mockResolvedValue(null);
      expect(await service.update(1, {} as any)).toBeNull();
    });

    it('should update and return route', async () => {
      mockRouteRepository.findOneBy
        .mockResolvedValueOnce({ id: 1, name: 'old' })
        .mockResolvedValueOnce({ id: 1, name: 'new' });
      mockRouteRepository.update.mockResolvedValue(undefined);
      expect(await service.update(1, { name: 'new' } as any)).toEqual({
        id: 1,
        name: 'new',
      });
    });
  });

  describe('remove', () => {
    it('should return true if deleted', async () => {
      mockRouteRepository.delete.mockResolvedValue({ affected: 1 });
      expect(await service.remove(1)).toBe(true);
    });

    it('should return false if not found', async () => {
      mockRouteRepository.delete.mockResolvedValue({ affected: 0 });
      expect(await service.remove(1)).toBe(false);
    });
  });
});
