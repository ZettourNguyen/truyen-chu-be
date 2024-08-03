import { Controller, Post, Delete, Get, Body, Param, Query, UseFilters } from '@nestjs/common';
import { FollowService } from './follow.service';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';

@Controller('follow')
@UseFilters(HttpExceptionFilter)
export class FollowController {
    constructor(private readonly followService: FollowService) {}

  @Get('check')
  async checkFollow(@Query('userId') userId: string,@Query('novelId') novelId: string) {
    return await this.followService.checkFollow(+userId, +novelId);
  }

  @Post('add')
  async addFollow(@Body()  body: { userId: number; novelId: number }) {
    return await this.followService.addFollow(+body.userId, +body.novelId);
  }

  @Delete('delete/:id')
  async deleteFollow(@Param('id') id: string) {
    // Gọi service để xóa Follow
    return await this.followService.deleteFollow(+id);
  }

  @Get('all/:userId')
  async getAllFollows(@Param('userId') userId: string) {
    return await this.followService.getAllFollows(+userId);
  }
}
