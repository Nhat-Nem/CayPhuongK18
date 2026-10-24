import { Test, TestingModule } from '@nestjs/testing';
import { RoomStaysController } from './room-stays.controller';

describe('RoomStaysController', () => {
  let controller: RoomStaysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomStaysController],
    }).compile();

    controller = module.get<RoomStaysController>(RoomStaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
