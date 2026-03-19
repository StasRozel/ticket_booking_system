import { Test, TestingModule } from '@nestjs/testing';
import { BusschedulesService } from './busschedules.service';

describe('BusschedulesService', () => {
  let service: BusschedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusschedulesService],
    }).compile();

    service = module.get<BusschedulesService>(BusschedulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
