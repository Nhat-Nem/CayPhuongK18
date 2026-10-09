import { Test, TestingModule } from '@nestjs/testing';
import { BookRequestsService } from './book-requests.service';

describe('BookRequestsService', () => {
  let service: BookRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookRequestsService],
    }).compile();

    service = module.get<BookRequestsService>(BookRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
