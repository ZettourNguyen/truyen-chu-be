import { Module } from '@nestjs/common';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chapter.service';
import { PrismaModule } from 'src/Prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [ChapterController],
  providers: [ChapterService],
  exports:[ChapterService]
})
export class ChapterModule {}
