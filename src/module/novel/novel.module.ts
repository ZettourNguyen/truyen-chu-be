import { Module } from '@nestjs/common';
import { NovelController } from './novel.controller';
import { PrismaModule } from 'src/Prisma/prisma.module';
import { NovelService } from './novel.service';

@Module({
    imports: [
        PrismaModule, 
      ], 
      controllers: [NovelController],
      providers: [NovelService],
})
export class NovelModule {}
