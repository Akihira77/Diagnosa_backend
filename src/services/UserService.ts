import { IUser, IUserDocument, User } from "../models/userModel.js";

class UserService {
	constructor(protected readonly userModel: typeof User) {}

	async createUser({ email, password }: IUser): Promise<IUser> {
		const user: IUserDocument = new User({
			email,
			password,
		});
		await user.save();
		return user;
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

export default new UserService(User);
