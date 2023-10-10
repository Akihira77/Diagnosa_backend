import { JwtPayload } from "jsonwebtoken";
import jwt, { Secret } from "jsonwebtoken";

export const jwtSign = (payload: JwtPayload, expiresIn: string) => {
    const secret = process.env.JWT_SECRET as Secret;
    const token = jwt.sign(payload, secret,{
        expiresIn,
    });

    return token;
}
