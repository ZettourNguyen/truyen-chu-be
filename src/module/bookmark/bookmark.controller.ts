import { Controller, Post, Delete, Get, Body, Param, Query, UseFilters } from '@nestjs/common';
import { BookmarkService } from './bookmark.service'; // Giả sử bạn đã tạo BookmarkService
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';

@Controller('bookmark')
@UseFilters(HttpExceptionFilter)
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get('check')
  async checkBookmark(@Query('userId') userId: string,@Query('novelId') novelId: string) {
    return await this.bookmarkService.checkBookmark(+userId, +novelId);
  }

  @Post('add')
  async addBookmark(@Body()  body: { userId: number; novelId: number }) {
    return await this.bookmarkService.addBookmark(+body.userId, +body.novelId);
  }

  @Delete('delete/:id')
  async deleteBookmark(@Param('id') id: string) {
    // Gọi service để xóa bookmark
    return await this.bookmarkService.deleteBookmark(+id);
  }

  @Get('all/:userId')
  async getAllBookmarks(@Param('userId') userId: string) {
    return await this.bookmarkService.getAllBookmarks(+userId);
  }
}
