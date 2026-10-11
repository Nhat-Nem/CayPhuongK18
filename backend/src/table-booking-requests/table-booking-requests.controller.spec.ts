import { Test, TestingModule } from '@nestjs/testing';
import { TableBookingRequestsController } from './table-booking-requests.controller';

describe('TableBookingRequestsController', () => {
  let controller: TableBookingRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TableBookingRequestsController],
    }).compile();

    controller = module.get<TableBookingRequestsController>(TableBookingRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
