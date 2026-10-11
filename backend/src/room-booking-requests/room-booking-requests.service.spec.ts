import { Test, TestingModule } from '@nestjs/testing';
import { RoomBookingRequestsService } from './room-booking-requests.service';

describe('RoomBookingRequestsService', () => {
  let service: RoomBookingRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomBookingRequestsService],
    }).compile();

    service = module.get<RoomBookingRequestsService>(RoomBookingRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
