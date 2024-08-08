import { IsString, IsOptional } from "class-validator";

export interface createAuthorDto{
    name: string
}
export class AuthorUpdateDto {
    @IsString()
    @IsOptional()
    firstname?: string;

    @IsString()
    @IsOptional()
    lastname?: string;

    @IsString()
    @IsOptional()
    nickname?: string;
}