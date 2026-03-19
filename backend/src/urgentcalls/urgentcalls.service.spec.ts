import { Test, TestingModule } from '@nestjs/testing';
import { UrgentcallsService } from './urgentcalls.service';

describe('UrgentcallsService', () => {
  let service: UrgentcallsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrgentcallsService],
    }).compile();

    service = module.get<UrgentcallsService>(UrgentcallsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
