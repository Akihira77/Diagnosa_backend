import bcrypt from "bcryptjs";
import { IRequestExtends, IResponseExtends } from "../utils/express-extends.js";
import { StatusCodes } from "../utils/constant.js";
import userService from "../services/userService.js";
import { IUser, IUserInputPassword } from "../@types/interfaces.js";
import { jwtSign } from "../utils/jwt.js";
import { BadRequestError, InternalServerError } from "../errors/main.error.js";
import { JwtPayload } from "jsonwebtoken";
import authService from "../services/authService.js";

export const register = async (
	req: IRequestExtends,
	res: IResponseExtends<string>
): Promise<void> => {
	try {
		const { email, password, confirmPassword }: IUserInputPassword =
			req.body;

		if (!email || !password) {
			throw new BadRequestError("email and password are required");
		}  else if (password !== confirmPassword) {
			throw new BadRequestError("password is not match");
		}

		const existingUser = await userService.findByEmail(email);

		if (existingUser) {
			res.status(StatusCodes.BadRequest400).send({
				message: "Email already registered",
			});
			return;
		}

		await userService.createUser(req.body);

		res.status(StatusCodes.Created201).send({
			message: "Successfully created user",
		});
		return;
	} catch (error) {
		throw new InternalServerError((error as Error).message);
	}
};

export const login = async (
	req: IRequestExtends,
	res: IResponseExtends<{ message: string }>
): Promise<void> => {
	try {
		const { email, password }: IUser = req.body;
		if (!email || !password) {
			throw new BadRequestError("email and password are required");
		}

		const user = await userService.findByEmail(email);
		if (!user) {
			throw new BadRequestError("email or password is not correct");
		}

		const isMatched = await bcrypt.compare(password, user.password);
		if (!isMatched) {
			throw new BadRequestError("email or password is not correct");
		}

		// 1 Hour
		const accessTokenExpiresIn = process.env.ACCESS_TOKEN ?? "1h";
		const refreshTokenExpiresIn = process.env.REFRESH_TOKEN ?? "1h";

		const payload: JwtPayload = {
			user: {
				userId: user._id,
				email: user.email,
			},
		};

		const accessToken = jwtSign(payload, accessTokenExpiresIn);
		const refreshToken = jwtSign(payload, refreshTokenExpiresIn);

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			sameSite: "strict",
		})
			.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				sameSite: "strict",
			})
			.status(StatusCodes.Accepted202)
			.json({ message: "Successfully logged in" });
		return;
	} catch (error) {
		throw new InternalServerError((error as Error).message);
	}
};

export const requestPasswordReset = async (req: IRequestExtends, res: IResponseExtends<{message:string}>): Promise<void> => {
	try {
		const requestPasswordResetService = await authService.requestPasswordReset(req.body.email);
		res.status(StatusCodes.Accepted202).json({message: requestPasswordResetService.link});
		return;
	} catch (error) {
		throw new InternalServerError((error as Error).message);
	}
}

export const resetPassword = async (req: IRequestExtends, res: IResponseExtends<{success:boolean}>) => {
	try {
		const resetPasswordService = await authService.resetPassword(
			req.body.userId,
			req.body.token,
			req.body.password,
			req.body.confirmPassword
		);
		
		res.status(StatusCodes.Accepted202).json({success: resetPasswordService});
		return;
	} catch (error) {
		throw new InternalServerError((error as Error).message);
	}
}