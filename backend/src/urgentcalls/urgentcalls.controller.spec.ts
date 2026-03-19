import { Test, TestingModule } from '@nestjs/testing';
import { UrgentcallsController } from './urgentcalls.controller';
import { UrgentcallsService } from './urgentcalls.service';

describe('UrgentcallsController', () => {
  let controller: UrgentcallsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrgentcallsController],
      providers: [UrgentcallsService],
    }).compile();

    controller = module.get<UrgentcallsController>(UrgentcallsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
