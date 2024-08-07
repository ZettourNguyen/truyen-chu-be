import { Module } from '@nestjs/common';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chapter.service';
import { PrismaModule } from 'src/Prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { FollowService } from '../follow/follow.service';
import { FollowModule } from '../follow/follow.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports:[PrismaModule, NotificationModule, FollowModule, FirebaseModule],
  controllers: [ChapterController],
  providers: [ChapterService],
  exports:[ChapterService]
})
export class ChapterModule {}
