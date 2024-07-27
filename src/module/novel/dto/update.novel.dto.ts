import { Tag } from "@prisma/client";
import { IsIn, IsNotEmpty, IsString } from "class-validator";

export interface UpdateNovelDTO{
    title?: string;
    image?: string;
    banner?: string;
    state?: string;
    description?: string;
    posterId?: number;
    tagsId?: number[]
    categoryId?: number
}

export class UpdateNovelImageDto {
    @IsString()
    @IsNotEmpty()
    novelId: string;

    @IsString()
    @IsNotEmpty()
    image: string;
}
export class UpdateStateDto {
    @IsString()
    @IsIn(["ongoing", "completed", "paused", "deleted", "unpublished", "pending"])
    state: string;
}