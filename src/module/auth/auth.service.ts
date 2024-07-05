import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { PrismaService } from 'src/Prisma/prisma.service';
import { comparePassword, hashPassword } from './helper/bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailSenderEmailVerify } from './helper/mailSender';
import { redisClient } from 'src/redis/connect';
import { KeyGenerator } from './helper/key';
import { generateVerificationCode } from './helper/verificationCode';

@Injectable()
export class AuthService {

  constructor(private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) { }

  async validateUserAndPassword(email: string, password: string) {
    const sensitiveUserInfoFields = ['id', 'username', 'email', 'avatar', 'birthday', 'gender', 'confirmed', 'createdAt', 'updatedAt'];
    const userInfo = await this.prisma.user.findFirst({
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        avatar: true,
        birthday: true,
        gender: true,
        confirmed: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        email: email
      }
    })
    if (!userInfo) {
      throw new UnauthorizedException('Email chưa tồn tại')
    }
    if (!comparePassword(password, userInfo.password)) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }
    const filteredUserInfo = Object.keys(userInfo)
      .filter(key => sensitiveUserInfoFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = userInfo[key];
        return obj;
      }, {} as typeof userInfo);
    return filteredUserInfo
  }

  async signToken(email: string, id: number) {
    const token = await this.jwtService.signAsync({
      email: email,
      id: id,
    })
    return { access_token: token }
  }


  async register(register: RegisterDTO) {

    const checkEmail = await this.prisma.user.findFirst({
      where: {
        email: register.email,
      },
    });
    if (checkEmail != null) {
      throw new ConflictException('Email đã tồn tại');
    }

    // Tạo người dùng mới
    const user = await this.prisma.user.create({
      data: {
        username: register.email.split("@")[0],
        email: register.email,
        password: hashPassword(register.password),
      },
    });
    if (!user) {
      throw new BadRequestException('Có lỗi trong quá trình tạo tài khoản, vui lòng thử lại.');
    }
    this.sendOTPVerify(user.email, user.username)

    return this.signToken(user.email, user.id)
  }

  async sendOTPVerify(email: string, username: string) {
    const code = generateVerificationCode()
    MailSenderEmailVerify(email, username, code) //ok
    await redisClient.setEx(KeyGenerator.createSignupOTPKey(email), 900, code) // 900s =15m
    console.log(code)
    //       return this.jwtService.sign(user)
  }


  // /user click vao button in mail => ()
  async handleVerifyCode(code, email) {
    const signupOTPKey = KeyGenerator.createSignupOTPKey(email);
    const otpInRedis = await redisClient.get(signupOTPKey);

    if (!otpInRedis || code !== otpInRedis) {
      return; // Trả về phản hồi không thành công nếu không khớp mã OTP
    }

    // Nếu mã OTP khớp, tiếp tục xử lý logic của bạn ở đây
    const changeStateConfirm = await this.prisma.user.update({
      where: {
        email: email
      },
      data: {
        confirmed: true
      }
    })
    if (changeStateConfirm) {
      throw new InternalServerErrorException(" can change confirmed for user")
      
    }
    // Xóa mã OTP từ Redis sau khi sử dụng (tuỳ vào logic của bạn)
    await redisClient.del(signupOTPKey)
    console.log('? da xoa redis?')
    const signupOTPKeyTest = KeyGenerator.createSignupOTPKey(email);
    const otpInRedisTest = await redisClient.get(signupOTPKey);
    console.log(signupOTPKeyTest)
    console.log(otpInRedisTest)

    console.log('handleVerifyCode successfull')

    // Trả về phản hồi thành công nếu cần
    return true

  }

}




