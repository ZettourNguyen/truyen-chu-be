import { Body, Controller, Get, Param, Post, UseFilters } from '@nestjs/common';
import { CreateNotificationDto, CreateNotificationByAdminDto } from './dto';
import { NotificationService } from './notification.service';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';

@Controller('notification')
@UseFilters(HttpExceptionFilter)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    // Endpoint để thêm thông báo
    @Post()
    async addNotification(@Body() createNotificationDto: CreateNotificationDto) {
        return this.notificationService.addNotification(createNotificationDto);
    }

    // Endpoint để thêm thông báo bởi admin cho tất cả user đang hoạt động
    @Post('/admin/:senderId')
    async addNotificationByAdmin(
        @Param("senderId") senderId :string,
        @Body() createNotificationByAdminDto: CreateNotificationByAdminDto) {
        return this.notificationService.addNotificationByAdmin(+senderId, createNotificationByAdminDto);
    }

    // Endpoint để lấy tất cả thông báo của người dùng
    @Get('/:userId')
    async getAllNotiByUserId(@Param('userId') userId: number) {
        return this.notificationService.getAllNotiByUserId(+userId);
    }
}
