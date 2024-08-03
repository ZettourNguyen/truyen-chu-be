import { Module } from '@nestjs/common';
import { ViewController } from './view.controller';
import { ViewService } from './view.service';
import { PrismaModule } from 'src/Prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [ViewController],
  providers: [ViewService]
})
export class ViewModule {}
