import { Test, TestingModule } from '@nestjs/testing';
import { WalkInVisitsService } from './walk-in-visits.service';

describe('WalkInVisitsService', () => {
  let service: WalkInVisitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalkInVisitsService],
    }).compile();

    service = module.get<WalkInVisitsService>(WalkInVisitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
