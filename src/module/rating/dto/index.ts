import { IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";

export class RatingCreateDto {
  @IsInt()
  @IsNotEmpty()
  novelId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number

  @IsString()
  content?: string

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}

export class RatingVoteDto {
  @IsInt()
  @IsNotEmpty()
  ratingId: number
  
  @IsInt()
  @IsNotEmpty()
  userId: number

  @IsString()
  @IsNotEmpty()
  interactionType: string
}