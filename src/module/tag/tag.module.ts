import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { PrismaModule } from 'src/Prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [TagController],
  providers: [TagService],
  exports: [TagService],
  
})
export class TagModule {}
