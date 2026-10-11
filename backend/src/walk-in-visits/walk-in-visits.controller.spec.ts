import { Test, TestingModule } from '@nestjs/testing';
import { WalkInVisitsController } from './walk-in-visits.controller';

describe('WalkInVisitsController', () => {
  let controller: WalkInVisitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalkInVisitsController],
    }).compile();

    controller = module.get<WalkInVisitsController>(WalkInVisitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
