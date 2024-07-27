import { Module } from '@nestjs/common';
import { NovelController } from './novel.controller';
import { PrismaModule } from 'src/Prisma/prisma.module';
import { NovelService } from './novel.service';
import { UserService } from '../auth/user.service';
import { AuthModule } from '../auth/auth.module';
import { AuthorModule } from '../author/author.module';
import { TagModule } from '../tag/tag.module';
import { CategoryModule } from '../category/category.module';
import { ChapterModule } from '../chapter/chapter.module';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    AuthorModule,
    TagModule,
    ChapterModule
  ],
  controllers: [NovelController],
  providers: [NovelService],
  exports:[NovelService]
})
export class NovelModule { }
