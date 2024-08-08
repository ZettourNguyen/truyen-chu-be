import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { PrismaModule } from 'src/Prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports:[PrismaModule, NotificationModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports:[RoleService]
})
export class RoleModule {}
