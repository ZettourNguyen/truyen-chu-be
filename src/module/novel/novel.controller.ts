import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, UseFilters } from '@nestjs/common';
import { NovelService } from './novel.service';
import { CreateNovel } from './dto/create.novel.dto';
import { UpdateNovelDTO, UpdateNovelImageDto, UpdateStateDto } from './dto/update.novel.dto';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';

@Controller('novel')
@UseFilters(HttpExceptionFilter)
export class NovelController {
    constructor(private readonly novelService: NovelService) {}

    @Get('get10Novel')
    async get10Novel() {
        return this.novelService.get10Novel();
    }
    @Get('getLast')
    async getNovelLast() {
        return this.novelService.getNovelLast();
    }
    @Get('id/:id')
    async getNovelById(@Param('id') id: string) {
        return this.novelService.findNovelById(+id);
    }
    @Get('/:id')
    async getNovelPageById(@Param('id') id: string) {
        return this.novelService.getNovelPageById(+id);
    }
    @Get('/random/6')// 6 cai
    async getNovelsByRandom() {
        return this.novelService.getNovelsByRandom()
    }

    @Get('list/:title')
    async novelByName(@Param('title') title: string) {
        const novel = await this.novelService.findManyNovelByName(title);
        return novel;
    }

    @Get()
    async getAllNovels() {
        return this.novelService.getAllNovels();
    }

    @Get('/author/:id')
    async getNovelsByAuthor(@Param('id') id: number) {
        return this.novelService.findNovelsByAuthor(+id)
    }
    @Get('/poster/:id')
    async findNovelsByPoster(@Param('id') id: number) {
        return this.novelService.findNovelsByPoster(+id)
    }
    @Get('/category/:id')
    async findNovelsByCategory(@Param('id') id: number) {
        return this.novelService.findNovelsByCategory(+id)
    }
    @Get('/tag/:id')
    async findNovelsByTag(@Param('id') id: number) {
        return this.novelService.findNovelsByTag(+id)
    }



    @Get('/me/:id')
    async findNovelsByMe(@Param('id') id: number) {
        return this.novelService.findNovelsByMe(+id)
    }

    
    
    @Post()
    async createNovel(@Body() createNovelDto: { data: CreateNovel; authorNameInInput: string, tagsId: JSON }) {
      const { data, authorNameInInput, tagsId } = createNovelDto;
      return this.novelService.createNovelWithTransaction(data, authorNameInInput, tagsId);
    }

    @Put('image')
    async updateNovelImageCover(@Body() updateNovelImageDto: UpdateNovelImageDto) {
        const { novelId, image } = updateNovelImageDto;
        return this.novelService.updateNovelImageCover(+novelId, image);
    }

    @Put(':id')
    async updateNovel(@Param('id') id: number, @Body() updateNovelDto: UpdateNovelDTO) {
        return this.novelService.updateNovel(+id, updateNovelDto);
    }   

    @Put('state/:id')
    async updateStateNovel(
        @Param('id') id: number,
        @Body() updateStateDto: UpdateStateDto
    ) {
        const { state } = updateStateDto; // Truy xuất state từ DTO
        return this.novelService.updateStateNovel(+id, state);
    }  

    @Delete(':id')
    async deleteNovel(@Param('id') id: number) {
        return this.novelService.deleteNovel(+id);
    }


}
