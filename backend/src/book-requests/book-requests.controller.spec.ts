import { Test, TestingModule } from '@nestjs/testing';
import { BookRequestsController } from './book-requests.controller';

describe('BookRequestsController', () => {
  let controller: BookRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookRequestsController],
    }).compile();

    controller = module.get<BookRequestsController>(BookRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
