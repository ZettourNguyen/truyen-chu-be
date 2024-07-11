import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, UseFilters } from '@nestjs/common';
import { NovelService } from './novel.service';
import { CreateNovel } from './dto/create.novel.dto';
import { UpdateNovel } from './dto/update.novel.dto';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';

@Controller('novel')
@UseFilters(HttpExceptionFilter)
export class NovelController {
    constructor(private readonly novelService: NovelService) {}

    @Get('get10Novel')
    async get10Novel() {
        return this.novelService.get10Novel();
    }
    @Get('id/:id')
    async getNovelById(@Param('id') id: string) {
        return this.novelService.getNovelById(+id);
    }

    @Get('search/:title')
    async novelByName(@Param('title') title: string) {
        const novel = await this.novelService.findManyNovelByName(title);
        return novel;
    }

    @Get()
    async getAllNovels() {
        return this.novelService.getAllNovels();
    }

    @Get('/random')// 6 cai
    async getNovelsByRandom() {
        return this.novelService.getNovelsByRandom()
    }
    
    @Post()
    async createNovel(@Body() createNovelDto: { data: CreateNovel; authorNameInInput: string, tagsId: JSON }) {
      const { data, authorNameInInput, tagsId } = createNovelDto;
      return this.novelService.createNovelWithTransaction(data, authorNameInInput, tagsId);
    }

    @Put(':id')
    async updateNovel(@Param('id') id: string, @Body() updateNovelDto: UpdateNovel) {
        updateNovelDto.id = +id;
        return this.novelService.updateNovel(updateNovelDto);
    }   

    @Delete(':id')
    async deleteNovel(@Param('id') id: string) {
        return this.novelService.deleteNovel(+id);
    }
}
