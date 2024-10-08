import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, Req, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { GetUser } from 'src/decorator/get-user.decorator';
import { RegisterDTO } from './dto/register.dto';
import { redisClient } from 'src/redis/connect';
import { UserService } from './user.service';
import { UpdateIsBlackList, UserUpdateImage } from './dto/user.dto';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';

@Controller('auth')
@UseFilters(HttpExceptionFilter)
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
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
        user = this.userService.getDataUserById(user?.id)
        return user; 
    } 

    @Post('avatar')
    updateImageAvatar(@Body() data: UserUpdateImage){
        const result = this.userService.updateImageAvatar(+data.id, data.avatar)
        return result
    }

    @Patch('block')
    blockUser(@Body() data: UpdateIsBlackList){
        const result = this.userService.changeBlackList(data)
        return result
    }

    @Post('register')
    register(@Body() registerData: RegisterDTO) {
        const result = this.authService.register(registerData);
        return result; 
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
         
    @Get('name/:id')
    async getName(@Param('id') id: string){
        const user = await this.userService.getUserName(+id)
        return user.username
    }
    @Get('user/:id')
    async getAll(@Param('id') id: string){
        const user = await this.userService.getAll(+id)
        return user
    }
}
