import { Test, TestingModule } from '@nestjs/testing';
import { ExportCsvController } from './export-csv.controller';

describe('ExportCsv Controller', () => {
  let controller: ExportCsvController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExportCsvController],
    }).compile();

    controller = module.get<ExportCsvController>(ExportCsvController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
