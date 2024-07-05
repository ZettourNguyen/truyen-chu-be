import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ConflictException, UseFilters } from '@nestjs/common';
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


    @Get()
    findAll() {
        return this.tagService.findAll();
    }

    // @Get(':name')
    // findOne(@Param('name') name: string) {
    //     return this.tagService.findOne(name);
    // }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
        return this.tagService.update(+id, updateTagDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tagService.remove(+id);
    }
}
