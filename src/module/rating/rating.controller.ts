import { Controller, Post, Body, Get, Param, Delete, Put, UseFilters } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingCreateDto, RatingVoteDto } from './dto';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';

@Controller('rating')
@UseFilters(HttpExceptionFilter)
export class RatingController {
  constructor(private readonly ratingService: RatingService) { }

  @Post()
  async createRating(@Body() ratingDto: RatingCreateDto) {
    return this.ratingService.createRating(ratingDto);
  }

  @Post(`vote`)
  async createVoteRating(@Body() voteDto: RatingVoteDto) {
    return this.ratingService.createVoteRating(voteDto);
  }

  @Get('average/:novelId')
  async getAverageRating(@Param('novelId') novelId: string) {
    return this.ratingService.getAverageRating(+novelId);
  }

  @Get('novel/:novelId')
  async getAllRatingInNovel(@Param('novelId') novelId: string){
    return this.ratingService.getAllRatingInNovel(+novelId)

  }
}