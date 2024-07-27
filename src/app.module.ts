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
import { UserService } from './module/auth/user.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CategoryModule } from './module/category/category.module';
import { CategoryController } from './module/category/category.controller';
import { CategoryService } from './module/category/category.service';
import { ChapterModule } from './module/chapter/chapter.module';
import { ChapterController } from './module/chapter/chapter.controller';
import { ChapterService } from './module/chapter/chapter.service';
import { HistoryModule } from './module/history/history.module';
import { HistoryController } from './module/history/history.controller';
import { HistoryService } from './module/history/history.service';

@Module({
  imports: [AuthModule, PrismaModule,
    JwtModule.register({
      secret: 'jwtsecretkey',
      signOptions: {
        expiresIn: '1h',
      },
    }),
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   autoSchemaFile: true,
    //   sortSchema: true,
    //   typePaths: ['./**/*.graphql'],
    //   // playground: false,
    // })
    // ,
    NovelModule, TagModule, AuthorModule, CategoryModule, ChapterModule, HistoryModule
  ],
  controllers: [NovelController, TagController, AuthController, AuthorController, CategoryController, ChapterController, HistoryController],
  providers: [AuthService, NovelService, TagService, AuthorService, UserService, CategoryService, ChapterService, HistoryService],
})
export class AppModule { }
