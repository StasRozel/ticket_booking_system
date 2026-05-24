import { Test, TestingModule } from '@nestjs/testing';
import { BusScheduleRepository } from './busschedule.repository';

describe('BusScheduleRepository', () => {
  let provider: BusScheduleRepository;

  const mockFindOneBy = jest.fn();
  const mockUpdate = jest.fn();

  const mockRepo = {
    findOneBy: mockFindOneBy,
    update: mockUpdate,
    async replaceDriverAndBus(id: number, bus_id?: number) {
      const busSchedule = await this.findOneBy({ id });
      if (!busSchedule) return null;
      await this.update(id, { bus_id });
      return await this.findOneBy({ id });
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BusScheduleRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();
    provider = module.get<BusScheduleRepository>(BusScheduleRepository);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('replaceDriverAndBus', () => {
    it('should return null if not found', async () => {
      (provider as any).findOneBy.mockResolvedValue(null);
      const result = await (provider as any).replaceDriverAndBus(1, 5);
      expect(result).toBeNull();
    });

    it('should update bus and return updated schedule', async () => {
      (provider as any).findOneBy
        .mockResolvedValueOnce({ id: 1, bus_id: 3 })
        .mockResolvedValueOnce({ id: 1, bus_id: 5 });
      (provider as any).update.mockResolvedValue(undefined);

      const result = await (provider as any).replaceDriverAndBus(1, 5);
      expect((provider as any).update).toHaveBeenCalledWith(1, { bus_id: 5 });
      expect(result).toEqual({ id: 1, bus_id: 5 });
    });
  });
});
