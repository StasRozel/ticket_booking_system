import { Test, TestingModule } from '@nestjs/testing';
import { Busschedule } from './busschedule.repository';

describe('Busschedule', () => {
  let provider: Busschedule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Busschedule],
    }).compile();

    provider = module.get<Busschedule>(Busschedule);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
