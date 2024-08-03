import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateNotificationDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    type: string; //  'success', 'error', 'info'
    
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsNumber()
    @IsNotEmpty()
    userId: number;
}

export class CreateNotificationByAdminDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    type: string; //  'success', 'error', 'info'
    
    @IsString()
    @IsNotEmpty()
    content: string;
}

export class  CreateManyNotificationDto{
    title: string
    type: string
    content: string
    userIds: number[]

}