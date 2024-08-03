export interface UserInfo {
    id: number;
    username: string;
    email: string;
    password: string;
    avatar: string;
    birthday: string;
    gender: number;
}

export interface UserUpdateImage{
    id:string
    avatar:string
}

export interface UpdateIsBlackList{
    userId: number
    userBlockId: number
}