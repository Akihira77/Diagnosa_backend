import { Schema, Document } from 'mongoose';

export interface IUser {
    email: string;
    password: string;
    token: string;
}

export interface IUserSignUp{
    email: string;
    password: string;
    token: string;
}

export interface IToken{
    userId:string | Schema.Types.ObjectId;
    token:string;
    createdAt:Date;
}

export interface ITokenDocument extends IToken, Document {}

export interface IUserInputPassword extends IUser{
    confirmPassword: string;
}

export interface ISendEmailOptions extends Document {
    email: string;
    subject: string;
    payload: unknown;
    template: string;
}

export interface IUserDocument extends IUser, Document {}