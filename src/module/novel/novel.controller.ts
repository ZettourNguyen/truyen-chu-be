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

    @Get('title/:title')
    async novelByName(@Param('title') title: string) {
        const novel = await this.novelService.novelByName(title);
        return novel;
    }

    @Get()
    async getAllNovels() {
        return this.novelService.getAllNovels();
    }
    
    @Post()
    async createNovel(@Body() createNovelDto: CreateNovel) {
        return this.novelService.createNovel(createNovelDto);
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
