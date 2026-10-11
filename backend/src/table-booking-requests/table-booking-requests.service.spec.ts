import { Test, TestingModule } from '@nestjs/testing';
import { TableBookingRequestsService } from './table-booking-requests.service';

describe('TableBookingRequestsService', () => {
  let service: TableBookingRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TableBookingRequestsService],
    }).compile();

    service = module.get<TableBookingRequestsService>(TableBookingRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
