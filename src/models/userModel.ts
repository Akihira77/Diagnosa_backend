import { Schema, model, Document } from "mongoose";

export interface IUser {
  email: string;
  password: string;
}

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    },
    { timestamps: true }
    );

export const User = model<IUserDocument>("User", UserSchema);