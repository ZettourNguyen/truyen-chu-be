import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { CreateManyNotificationDto, CreateNotificationByAdminDto, CreateNotificationDto } from './dto';
import { RoleService } from '../role/role.service';

@Injectable()
export class NotificationService {
    constructor( private readonly prisma: PrismaService,
        private readonly roleService: RoleService
    ){}

    async addNotification(data: CreateNotificationDto){
        const notification = await this.prisma.notification.create({
            data
        })
        return notification
    }

   async createManyNotification(data: CreateManyNotificationDto  ) {
    const notificationsData = data.userIds.map(userId => ({
      title: data.title,
      type: data.type,
      content: data.content, // Có thể thay đổi nội dung thông báo nếu cần
      userId
    }));

    const notifications = await this.prisma.notification.createMany({
      data: notificationsData
    });

    return notifications;
  }

    async addNotificationByAdmin(senderId: number, data: CreateNotificationByAdminDto){
        //getAll userId
        await this.roleService.checkPermission(senderId ,"Admin")
        const allUserId = await this.prisma.user.findMany({
            where:{
                blacklist: false
            },
            select:{
                id:true
            }
        })

        const notifications = Promise.all(allUserId.map(
            async (userId) => {
                const notification = await this.prisma.notification.create({
                    data: {
                        ...data,
                        userId: userId.id
                    }
                })
            }
        ))
        
        return true
    }

    async getAllNotiByUserId(userId: number){
        const notifications = await this.prisma.notification.findMany({
            where:{
                userId
            }
        })
        return notifications
    }

}
