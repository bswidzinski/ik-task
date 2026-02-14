import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService, LowStockReport } from './reports.service';
import { LowStockQueryDto } from './dto/low-stock-query.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('low-stock')
  getLowStockReport(@Query() query: LowStockQueryDto): Promise<LowStockReport> {
    return this.reportsService.getLowStockReport(query.threshold);
  }
}
