import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PrismaModule } from 'src/Prisma/prisma.module';
import { NovelModule } from '../novel/novel.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports:[PrismaModule, NovelModule, RoleModule],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports:[CategoryService]
})
export class CategoryModule {}
