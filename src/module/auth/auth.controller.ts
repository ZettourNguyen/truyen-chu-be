import { BadRequestException, Body, Controller, Get, Post, Query, Req, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { GetUser } from 'src/decorator/get-user.decorator';
import { RegisterDTO } from './dto/register.dto';
import { redisClient } from 'src/redis/connect';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private jwtService: JwtService,
    ) { }

    @Post('login')
    @UseGuards(AuthGuard('local'))
    signin(@Req() req: Request) {
        const user = req.user;
        const accessToken = this.jwtService.sign(user);
        return { accessToken }; 
    }

    @Get('getUser')
    @UseGuards(AuthGuard('jwt'))
    testApi(@GetUser() user) {
        console.log("GetUser")
        return user; 
    } 

    @Post('register')
    register(@Body() registerData: RegisterDTO) {
        return this.authService.register(registerData);
    }

    @Get('verify')
    async verifyEmail(@Query('code') code: string, @Query('email') email: string) {
        if (!code || !email) {
            throw new BadRequestException('Verification code and email are required');
        }

        const result = await this.authService.handleVerifyCode(code, email);
        if (result) {
            return 'Email verified successfully';
        } else {
            throw new BadRequestException('Verification failed');
        }
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(@Req() req: Request) {
        const token = req.headers.authorization?.split(' ')[1];
        console.log(token)
        if (!token) {
            throw new UnauthorizedException('Authorization token not found');
        }

        await redisClient.set(`blacklist_${token}`, token);

        return { message: 'Logged out successfully' };
    }
}
