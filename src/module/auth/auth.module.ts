import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/Prisma/prisma.module'; // Đảm bảo import PrismaModule từ đường dẫn chính xác
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UserService } from './user.service';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    PrismaModule, 
    PassportModule, RoleModule, 
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET || 'jwtsecretkey',
      signOptions: {
        expiresIn: process.env.ACCESS_TOKEN_LIFE || "1d",
      },
    })
  ], 
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, UserService],
  exports:[UserService]
})
export class AuthModule { }
