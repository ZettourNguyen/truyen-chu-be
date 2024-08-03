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
import { CommentModule } from './module/comment/comment.module';
import { CommentController } from './module/comment/comment.controller';
import { CommentService } from './module/comment/comment.service';
import { RoleModule } from './module/role/role.module';
import { RoleController } from './module/role/role.controller';
import { RoleService } from './module/role/role.service';
import { BookmarkModule } from './module/bookmark/bookmark.module';
import { FollowModule } from './module/follow/follow.module';
import { BookmarkController } from './module/bookmark/bookmark.controller';
import { FollowController } from './module/follow/follow.controller';
import { BookmarkService } from './module/bookmark/bookmark.service';
import { FollowService } from './module/follow/follow.service';
import { NotificationModule } from './module/notification/notification.module';
import { NotificationController } from './module/notification/notification.controller';
import { NotificationService } from './module/notification/notification.service';
import { RatingModule } from './module/rating/rating.module';
import { RatingService } from './module/rating/rating.service';
import { ViewService } from './module/view/view.service';
import { RatingController } from './module/rating/rating.controller';
import { ViewController } from './module/view/view.controller';
import { ReportModule } from './module/report/report.module';
import { ReportController } from './module/report/report.controller';
import { ReportService } from './module/report/report.service';

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
    NovelModule, TagModule, AuthorModule, CategoryModule, ChapterModule, HistoryModule, CommentModule, RoleModule, 
    BookmarkModule, FollowModule, NotificationModule, RatingModule, ReportModule
  ],
  controllers: [NovelController, TagController, AuthController, AuthorController, RoleController, ReportController,
    BookmarkController, FollowController, NotificationController, RatingController, ViewController,
    CategoryController, ChapterController, HistoryController, CommentController],
  providers: [AuthService, NovelService, TagService, AuthorService, UserService, RoleService,ReportService,
    BookmarkService, FollowService, NotificationService, RatingService, ViewService,
    CategoryService, ChapterService, HistoryService, CommentService],
})
export class AppModule { }
