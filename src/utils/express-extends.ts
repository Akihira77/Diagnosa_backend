import { Request } from "express";

type UserType = {
    userId: string;
    email: string;
};

export interface IRequestExtends extends Request {
    user?: UserType;
}
