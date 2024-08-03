import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ConflictException, UseFilters, Query } from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';

@Controller('tags')
@UseFilters(HttpExceptionFilter)
export class TagController {
    constructor(private readonly tagService: TagService) { }

    @Post()
    async create(@Body() createTagDto: CreateTagDto) {
        const createdTag = await this.tagService.create(createTagDto);
        return createdTag;
    }
    @Get('name/:id')
    async getName(@Param('id') id: string) {
        return this.tagService.getTagName(+id)
    }

    @Get()
    findAll() {
        return this.tagService.findAll();
    }

    @Get('novel/:id')
    getAllTagIdByNovelId(@Param('id') id: string) {
        return this.tagService.getTagByNovelId(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
        return this.tagService.update(+id, updateTagDto);
    }

    @Delete(':userId')
    remove(
        @Param('userId') userId: string,
        @Query('tagId') tagId: string) 
        {
        return this.tagService.remove(+userId, +tagId);
    }
}
