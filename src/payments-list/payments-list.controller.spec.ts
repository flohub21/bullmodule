import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsListController } from './payments-list.controller';

describe('PaymentsListService Controller', () => {
  let controller: PaymentsListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsListController],
    }).compile();

    controller = module.get<PaymentsListController>(PaymentsListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
