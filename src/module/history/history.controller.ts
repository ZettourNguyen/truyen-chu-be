import { Controller, Get, Post, Query, Body, UseFilters, Param, Delete } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';

@Controller('history')
@UseFilters(HttpExceptionFilter)
export class HistoryController {
    constructor(private readonly historyService: HistoryService) {}

    @Get('check')
    async checkHistory(
        @Body() userId: { userId: number; novelId: number }
    ) {
        const histories = await this.historyService.checkHistoryOfNovelExists(userId.userId, userId.novelId);
        return histories
    }

    @Post('add')
    async addHistory(
        @Body() body: { userId: number; chapterId: number }
    ) {
        return await this.historyService.addOrUpdateNovelHistory(body.userId, body.chapterId);
    }

    @Get(':id')
    async getHistory(
        @Param('id') id: number,
    ) {
        const result = await this.historyService.getUserHistory(+id);
        return result;
    }
    @Delete('remove/:id')
    async rmHistory(
        @Param('id') id: string, 
    ) {
        return await this.historyService.deleteHistory(+id);
    }
}
