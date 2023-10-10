type PayloadType = {
    userId: string;
    email: string;
};

declare module "jsonwebtoken" {
    export interface JwtPayload {
        user: PayloadType;
    }
    // interface UserPayloadJwt extends jwt.JwtPayload {
    //     user: PayloadType;
    // }
}

export {};
