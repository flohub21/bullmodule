import { Test, TestingModule } from '@nestjs/testing';
import { OperationsWorkflowService } from './operations-workflow.service';

describe('OperationsWorkflowService', () => {
  let service: OperationsWorkflowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OperationsWorkflowService],
    }).compile();

    service = module.get<OperationsWorkflowService>(OperationsWorkflowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
