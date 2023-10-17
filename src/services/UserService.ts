import { IUser, IUserDocument, IUserSignUp } from "../@types/interfaces.js";
import { User } from "../models/userModel.js";
import JWT from "jsonwebtoken";

class userService {
	constructor(protected readonly userModel: typeof User) {}

	async createUser({ email, password }: IUser): Promise<IUserSignUp> {
		const user: IUserDocument = new User({
			email,
			password,
		});
		const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET!);
		await user.save();
		return {
			email: user.email,
			password: user.password,
			token: token,
		};
	}

	async findByEmail(email: string): Promise<IUserDocument | null> {
		const user = await User.findOne({ email });
		if (user) {
			return user;
		}
		return null;
	}

	catchingError(error: unknown): void {
		if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error("An unknown error occurred");
		}
	}
}

export default new userService(User);
