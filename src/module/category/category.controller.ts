import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ConflictException, UseFilters, Query } from '@nestjs/common';

import { HttpExceptionFilter } from 'src/utils/http-exception.filter';
import { CategoryService } from './category.service';
import { CreateCategoryDTO } from './dto/createDTO';
import { UpdateCategoryDTO } from './dto';

@Controller('category')
@UseFilters(HttpExceptionFilter)
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    async create(@Body() data: CreateCategoryDTO) {
        const createdCategory = await this.categoryService.create(data);
        return createdCategory;
    }

    @Get()
    async findAll() {
        return this.categoryService.findAll();
    }
    @Get('name/:id')
    async getName(@Param('id') id: string) {
        return this.categoryService.getCategoryName(+id)
    }

    @Get('/novel/:id')
    async findCategoryName(@Param('id') id: number) {
        const name = await this.categoryService.getCategoryName(+id)
        return name
    }

    @Get('/:id')
    async listNovels(@Param('id') id: number) {
        const listNovels = await this.categoryService.listNovels(+id)
        return listNovels
    }

    @Patch(':id')
    async update(@Param('id') id: string,
     @Body()data: UpdateCategoryDTO
    ) {
        return this.categoryService.update(+id,data.userId, data.name, data.description);
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @Query('categoryId') categoryId: string) {
        return this.categoryService.remove(+id, +categoryId);
    }
}
