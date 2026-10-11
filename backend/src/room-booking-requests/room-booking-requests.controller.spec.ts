import { Test, TestingModule } from '@nestjs/testing';
import { RoomBookingRequestsController } from './room-booking-requests.controller';

describe('RoomBookingRequestsController', () => {
  let controller: RoomBookingRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomBookingRequestsController],
    }).compile();

    controller = module.get<RoomBookingRequestsController>(RoomBookingRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
