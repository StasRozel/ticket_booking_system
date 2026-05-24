import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintsService } from './complaints.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Complaint } from './entities/complaint.entity';

describe('ComplaintsService', () => {
  let service: ComplaintsService;

  const mockComplaintRepository = {
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
        ComplaintsService,
        {
          provide: getRepositoryToken(Complaint),
          useValue: mockComplaintRepository,
        },
      ],
    }).compile();
    service = module.get<ComplaintsService>(ComplaintsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create and save a complaint', async () => {
      const dto = { text: 'Bad service' };
      mockComplaintRepository.create.mockReturnValue(dto);
      mockComplaintRepository.save.mockResolvedValue({ id: 1, ...dto });
      expect(await service.create(dto as any)).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('should return all complaints', async () => {
      mockComplaintRepository.find.mockResolvedValue([{ id: 1 }]);
      expect(await service.findAll()).toEqual([{ id: 1 }]);
    });
  });

  describe('findOneByUserId', () => {
    it('should find by userId', async () => {
      mockComplaintRepository.findOneBy.mockResolvedValue({ id: 1, userId: 5 });
      expect(await service.findOneByUserId(5)).toEqual({ id: 1, userId: 5 });
      expect(mockComplaintRepository.findOneBy).toHaveBeenCalledWith({
        userId: 5,
      });
    });
  });

  describe('findOne', () => {
    it('should return complaint by id', async () => {
      mockComplaintRepository.findOneBy.mockResolvedValue({ id: 1 });
      expect(await service.findOne(1)).toEqual({ id: 1 });
    });
  });

  describe('update', () => {
    it('should return null if not found', async () => {
      mockComplaintRepository.findOneBy.mockResolvedValue(null);
      expect(await service.update(1, {} as any)).toBeNull();
    });

    it('should update and return complaint', async () => {
      const existing = { id: 1, text: 'old' };
      mockComplaintRepository.findOneBy
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce({ ...existing, text: 'new' });
      mockComplaintRepository.update.mockResolvedValue(undefined);
      expect(await service.update(1, { text: 'new' } as any)).toEqual({
        id: 1,
        text: 'new',
      });
    });
  });

  describe('remove', () => {
    it('should return true if deleted', async () => {
      mockComplaintRepository.delete.mockResolvedValue({ affected: 1 });
      expect(await service.remove(1)).toBe(true);
    });

    it('should return false if not found', async () => {
      mockComplaintRepository.delete.mockResolvedValue({ affected: 0 });
      expect(await service.remove(1)).toBe(false);
    });
  });
});
