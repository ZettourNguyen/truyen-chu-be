import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { PrismaModule } from 'src/Prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [HistoryController],
  providers: [HistoryService]
})
export class HistoryModule {}
