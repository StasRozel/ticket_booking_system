import { Test, TestingModule } from '@nestjs/testing';
import { BusschedulesController } from './busschedules.controller';
import { BusschedulesService } from './busschedules.service';

describe('BusschedulesController', () => {
  let controller: BusschedulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusschedulesController],
      providers: [BusschedulesService],
    }).compile();

    controller = module.get<BusschedulesController>(BusschedulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
