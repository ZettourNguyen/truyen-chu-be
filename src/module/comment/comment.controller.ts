import { Controller, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';
import { Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';

@Controller('comment')
@UseFilters(HttpExceptionFilter)
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @Get()
  async findAll() {
    return this.commentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.commentService.findOne(+id);
  }

  @Get('novel/:novelId')
  async findByNovel(@Param('novelId') novelId: string) {
    return this.commentService.findByNovel(+novelId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
