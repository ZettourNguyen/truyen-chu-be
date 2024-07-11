import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { redisClient } from 'src/redis/connect';
import { KeyGenerator } from './key';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: 'true',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAILPASSWORD1,
    },
});

const url = 'http://localhost:3001/auth/verify?'

export async function MailSenderEmailVerify(email: string, username: string, code: string) {
    console.log(`Email: ${process.env.EMAIL}`);

    try {
        const info = await transporter.sendMail({
            from: "Kho Truyện Chữ <zettournguyen@gmail.com>", // sender address
            to: email, // list of receivers
            subject: "Xác nhận email của bạn", // tieu de ex: 	Verify your new account
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #fff;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    }
                    h1 {
                        color: #007bff;
                    }
                    p {
                        font-size: 16px;
                        line-height: 1.6;
                        margin-bottom: 20px;
                    }
                    .note {
                        font-style: italic;
                        color: #6c757d;
                        margin-bottom: 20px;
                    }
                    href {
                        color:#fff;
                    }
                    .button {
                        display: inline-block;
                        background-color: #007bff;
                        color: #fff;
                        text-decoration: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        transition: background-color 0.3s;
                    }
                    .button:hover {
                        background-color: #0056b3;
                    }
                    .footer{
                        margin-bottom:5px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Xác thực Email của bạn</h1>
                    <p>Chào <b>${username}</b>,</p>
                    <p>Để xác thực email của bạn, vui lòng click vào nút bên dưới:</p>
                    <a href="${url}code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}" style="color:#fff;font-size: 20px;font-weight: bold;" class="button">Xác thực Email của bạn</a>
                    <p class="note">Thông báo xác thực email này có hiệu lực trong vòng 15 phút. Nếu qua 15 phút, xin vui lòng xin xác thực lại.</p>
                    <div class="footer">
                      <p>Cảm ơn bạn,</p>
                      <p>Nguyễn Văn Thịnh</p>
                    </div>
                    
                </div>
            </body>
            </html>
        `,
        });
        console.log('Message sent: %s', info.response);
        if (info.accepted.length > 0) {
            console.log("Message sent: %s", info.messageId);
            return true;
        } else {
            console.log("Message not accepted");
            return false;
        }
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }

}

