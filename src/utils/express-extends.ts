import { Request, Response } from "express";
import { Send } from "express-serve-static-core";

type UserType = {
    userId: string;
    email: string;
};

export interface IRequestExtends extends Request {
    user?: UserType;
}

export interface IResponseExtends<ResBody> extends Response {
    json: Send<ResBody, this>;
}

