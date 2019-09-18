import { Test, TestingModule } from '@nestjs/testing';
import { OperationsWorkflowController } from './operations-workflow.controller';

describe('OperationsWorkflow Controller', () => {
  let controller: OperationsWorkflowController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperationsWorkflowController],
    }).compile();

    controller = module.get<OperationsWorkflowController>(OperationsWorkflowController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
