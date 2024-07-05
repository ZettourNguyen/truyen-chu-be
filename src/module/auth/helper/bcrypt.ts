import * as bcrypt from "bcryptjs";
import * as dotenv from 'dotenv';

dotenv.config();

const saltRounds = parseInt(process.env.saltRounds);

export function hashPassword(myPlaintextPassword: string): string {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(myPlaintextPassword, salt);
    return hash;
} 

export function comparePassword(myPlaintextPassword: string, hashPassword: string):boolean{
    const result = bcrypt.compareSync(myPlaintextPassword, hashPassword)
    return result
}