import jwt from 'jsonwebtoken';

export async function generateToken(payload: any, secretSignature: any, tokenLife: any) {
    try {
        return await jwt.sign(
            {
                payload,
            },
            secretSignature,
            {
                algorithm: 'HS256',
                expiresIn: tokenLife,
            }
        );
    } catch (error) {
        console.log(`Error in generate access token: ${error}`);
        return null;
    }
}
