import { NextFunction, Request, Response } from "express";
import { UnauthenticatedError } from "../errors/main.error.js";
import jwt from "jsonwebtoken";
import { IRequestExtends } from "../utils/express-extends.js";

type PayloadType = {
    userId: string;
    email: string;
};

declare module "jsonwebtoken" {
    interface UserPayloadJwt extends jwt.JwtPayload {
        user: PayloadType;
    }
}

const authMiddleware = (
    req: IRequestExtends,
    res: Response,
    next: NextFunction
) => {
    const authHeaders = req.headers.authorization;

    if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
        throw new UnauthenticatedError("Token must provided");
    }

    const token = authHeaders.split(" ")[1]!;
    try {
        const payload = <jwt.UserPayloadJwt>(
            jwt.verify(token, process.env.JWT_SECRET!)
        );

        req.user = {
            userId: payload.userId,
            email: payload.email,
        };
        next();
    } catch (error) {
        throw new UnauthenticatedError("Authentication Invalid");
    }
};

export default authMiddleware;
