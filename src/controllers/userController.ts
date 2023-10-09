import bcrypt from 'bcryptjs'
import { IRequestExtends, IResponseExtends } from '../utils/express-extends.js'
import { StatusCodes } from '../utils/constant.js'
import { createUser, findByEmail } from '../services/UserService.js'
import { IUser } from '../models/userModel.js';
import { jwtSign } from '../utils/jwt.js';
import { JwtPayload } from 'jsonwebtoken';

export const register = async (req: IRequestExtends, res: IResponseExtends<string>) => {
    try {
        console.log('register controller running');
        const { email, password } = req.body
    
        if(!email || !password) {
            return res.status(StatusCodes.BadRequest400).send({message: 'email and password are required'});
        } else if(password.length < 6) {
            return res.status(StatusCodes.BadRequest400).send({message: 'password must be at least 6 characters'}
        )}
    
        //check email apakah sudah ada di db
        const existingUser = await findByEmail(email);
        if(existingUser) {
            return res.status(StatusCodes.BadRequest400).send({message: 'Email already registered'});
        }
    
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
        await createUser({email, password: hashedPassword});
    
        return res.status(StatusCodes.Created201).send({message: 'Successfully created user'});    
    } catch (error) {
        return res.status(StatusCodes.InternalServerError500).send({message: (error as Error).message});
    }
    
}

export const login = async (
    req: IRequestExtends, 
    res: IResponseExtends<{message:string}>) => {
        try {
            const { email, password }: IUser = req.body;
            if (!email || !password) {
                return res.status(StatusCodes.BadRequest400).send({ message: "email and password are required" });
            }

            const user = await findByEmail(email);
            if (!user) {
                return res.status(StatusCodes.BadRequest400).send({ message: "Email or password is wrong" });
            }

            const isMatched = await bcrypt.compare(password, user.password);
            if (!isMatched) {
                return res.status(StatusCodes.BadRequest400).send({ message: "Email or password is wrong" });
            }

            const accessTokenExpiresIn = process.env.ACCESS_TOKEN ?? "";
            const refreshTokenExpiresIn = process.env.REFRESH_TOKEN ?? "";

            const payload :JwtPayload = {
                user: {
                    userId: user._id,
                    email: user.email,
                },
            }

            const accessToken = jwtSign(payload, accessTokenExpiresIn);
            const refreshToken = jwtSign(payload, refreshTokenExpiresIn);

            return res.cookie('accessToken', accessToken, {
                httpOnly: true,
                sameSite: 'strict'
            }).cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'strict'
            }).status(StatusCodes.Accepted202).json({message: 'Successfully logged in'
            })

        } catch (error:unknown) {
            return res.status(StatusCodes.InternalServerError500).send({message: (error as Error).message});
        }
    }





