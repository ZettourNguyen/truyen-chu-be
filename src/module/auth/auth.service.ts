import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { PrismaService } from 'src/Prisma/prisma.service';
import { comparePassword, hashPassword } from './helper/bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailSenderEmailVerify } from './helper/mailSender';
import { redisClient } from 'src/redis/connect';
import { KeyGenerator } from './helper/key';
import { generateVerificationCode } from './helper/verificationCode';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { RoleService } from '../role/role.service';

@Injectable()
export class AuthService {

  constructor(private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly roleService : RoleService
  ) { }
  // 
  async validateUserAndPassword(email: string, password: string) {
    const sensitiveUserInfoFields = ['id', 'username', 'email'];
    const userInfo = await this.prisma.user.findFirst({
      where: {
        email: email,
      }
    })
    if (!userInfo) {
      throw new UnauthorizedException('Email chưa tồn tại')
    }
    if (userInfo.blacklist) {
      throw new UnauthorizedException("Đăng nhập thất bại, bạn đã bị cấm!!")
    }
    if (!comparePassword(password, userInfo.password)) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }
    const roleIds = (await this.roleService.getManyRoleIdOfUserId(userInfo.id)).map(roleId => roleId.roleId)
    const filteredUserInfo = Object.keys(userInfo)
      .filter(key => sensitiveUserInfoFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = userInfo[key];
        return obj;
      }, {} as typeof userInfo);
    return {...filteredUserInfo, roleIds}
  }

  // async signToken(id: number, username: string, email: string, roleIds: number[]) {
  //   const token = await this.jwtService.sign({
  //     id: id,
  //     username: username,
  //     email: email,
  //     roleIds: roleIds
  //   })
  //   return { access_token: token }
  // }


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
    const role = await this.prisma.userToRole.create({
      data:{
        userId: user.id,
        roleId: 3 // day la id role User
      }
    })
    this.sendOTPVerify(user.email, user.username)
    return true
  }

  // async sendOTPVerify(email: string, username: string) {
  //   const code = generateVerificationCode()
  //   MailSenderEmailVerify(email, username, code) //ok
  //   await redisClient.setEx(KeyGenerator.createSignupOTPKey(email), 900, code) // 900s =15m
  //   //       return this.jwtService.sign(user)
  // }
  async sendOTPVerify(email: string, username: string) {
    const redisKey = KeyGenerator.createSignupOTPKey(email);
    const existingToken = await redisClient.get(redisKey);
    if (existingToken) {
        // Xóa token cũ trong Redis
        await redisClient.del(redisKey);
    }
    const code = generateVerificationCode();
    await redisClient.setEx(redisKey, 900, code); // 900 giây = 15 phút
    MailSenderEmailVerify(email, username, code);
    return { message: 'Verification code sent successfully' };
}

  // /user click vao button in mail => ()
  async handleVerifyCode(code, email) {
    const signupOTPKey = KeyGenerator.createSignupOTPKey(email);
    const otpInRedis = await redisClient.get(signupOTPKey);

    if (!otpInRedis || code !== otpInRedis) {
      throw new NotFoundException("Mã xác nhận đã hết hạn")
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
    if (!changeStateConfirm) {
      throw new InternalServerErrorException("Trạng thái confirmed chưa được thay đổi")
    }
    // Xóa mã OTP từ Redis sau khi sử dụng
    await redisClient.del(signupOTPKey)
    console.log('handleVerifyCode successfull')
    // Trả về phản hồi thành công nếu cần
    return true

  }
  

}




