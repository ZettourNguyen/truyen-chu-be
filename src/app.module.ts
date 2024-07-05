import { Module } from '@nestjs/common';
import { AuthService } from './module/auth/auth.service';
import { AuthModule } from './module/auth/auth.module';
import { PrismaModule } from './Prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { NovelController } from './module/novel/novel.controller';
import { NovelService } from './module/novel/novel.service';
import { NovelModule } from './module/novel/novel.module';
import { TagController } from './module/tag/tag.controller';
import { TagModule } from './module/tag/tag.module';
import { AuthController } from './module/auth/auth.controller';
import { TagService } from './module/tag/tag.service';
import { AuthorModule } from './module/author/author.module';
import { AuthorService } from './module/author/author.service';
import { AuthorController } from './module/author/author.controller';

@Module({
  imports: [AuthModule, PrismaModule, 
    JwtModule.register({
      secret: 'jwtsecretkey',
      signOptions: {
        expiresIn: '1h',
      },
      
    }), NovelModule, TagModule, AuthorModule
  ],
  controllers: [NovelController, TagController, AuthController, AuthorController],
  providers: [AuthService, NovelService, TagService, AuthorService],
})
export class AppModule {}
