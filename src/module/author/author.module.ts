import { Module } from '@nestjs/common';
import { AuthorController } from './author.controller';
import { AuthorService } from './author.service';
import { PrismaModule } from 'src/Prisma/prisma.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports:[PrismaModule, RoleModule],
  controllers: [AuthorController],
  providers: [AuthorService],
  exports: [AuthorService],
})
export class AuthorModule {}
