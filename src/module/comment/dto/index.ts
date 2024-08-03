// create-comment.dto.ts
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
    @IsInt()
    novelId: number;

    @IsString()
    content: string;

    @IsInt()
    userId: number;

    @IsOptional()
    @IsInt()
    parentId?: number; 
}

  export class UpdateCommentDto {
    readonly content?: string;
    readonly userId?: number;
    readonly novelId?: number;
  }
    