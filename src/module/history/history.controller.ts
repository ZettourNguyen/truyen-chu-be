import { Controller, Get, Post, Query, Body, UseFilters, Param } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';

@Controller('history')
@UseFilters(HttpExceptionFilter)
export class HistoryController {
    constructor(private readonly historyService: HistoryService) {}

    @Get('check')
    async checkHistory(
        @Query('userId') userId: number,
        @Query('chapterId') chapterId: number,
    ) {
        const exists = await this.historyService.checkHistoryExists(userId, chapterId);
        return { exists: !!exists };
    }

    // @Post('add')
    // async addHistory(
    //     @Body() body: { userId: number; chapterId: number }
    // ) {
    //     await this.historyService.addOrUpdateNovelHistory(body.userId, body.chapterId);
    //     return { success: true };
    // }

    @Get(':id')
    async getHistory(
        @Param('id') id: number,
    ) {
        const result = await this.historyService.getUserHistory(+id);
        return result;
    }
}
