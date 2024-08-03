import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { PrismaModule } from 'src/Prisma/prisma.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports:[PrismaModule, RoleModule],
  controllers: [TagController],
  providers: [TagService],
  exports: [TagService],
  
})
export class TagModule {}
