import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';
import { CreateReport } from './dto';
import { ReportService } from './report.service';

@Controller('report')
@UseFilters(HttpExceptionFilter)
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

    @Post()
    async createReport(
        @Body() createReportDto: CreateReport) {
        const report = await this.reportService.createReport(createReportDto);
        return report;
    }

    @Get()
    async getReports() {
        return this.reportService.getReports();
    }

    @Patch()
    async updateReport(@Body() body: { userId: string; reportId: string }) {
        const { userId, reportId } = body;
        console.log(body)
        return this.reportService.updateReport(userId, reportId);
    }
}