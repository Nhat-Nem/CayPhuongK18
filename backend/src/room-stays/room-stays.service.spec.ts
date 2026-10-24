import { Test, TestingModule } from '@nestjs/testing';
import { RoomStaysService } from './room-stays.service';

describe('RoomStaysService', () => {
  let service: RoomStaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomStaysService],
    }).compile();

    service = module.get<RoomStaysService>(RoomStaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
