import { Controller, Post, Param, Get, Query, UseFilters } from '@nestjs/common';
import { ViewService } from './view.service';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';

@Controller('view')
@UseFilters(HttpExceptionFilter)
export class ViewController {
  constructor(private readonly viewService: ViewService) {}

  @Post('increment/:chapterId')
  async incrementView(@Param('chapterId') chapterId: string, @Query('userId') userId: string) {
    return this.viewService.incrementView(+userId, +chapterId);
  }

  @Get('total/:novelId')
  async getTotalViews(@Param('novelId') novelId: number) {
    return this.viewService.getTotalViews(novelId);
  }
}
