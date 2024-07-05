

export class KeyGenerator {

    static createSignupOTPKey = (email: string) => {

        return `otp:signup:${email}`

    }

    static createForgotPasswordOTPKey = (email: string) => {

        return `otp:forgot-password:${email}}`
        
    }

    static createResetPasswordKey = (email: string) => {

        return `confirmation-code:reset-password:${email}}`
        
    }

    static createAccessTokenkey = (accessToken: string) => {

        return `token:access-token:${accessToken}`

    }

    static createRefreshTokenKey = (refreshToken: string) => {

        return `token:refresh-token:${refreshToken}`

    }
    
}