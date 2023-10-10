import { IUser, IUserDocument, User } from "../models/userModel.js";

export const createUser = async ({
    email,
    password
}:IUser): Promise<IUserDocument> => {
    try {
        const user: IUserDocument = new User({
            email,
            password
        });
        await user.save();
        return user;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error('An unknown error occurred'); 
            }
        }
    }

    export const findByEmail = async (email: string): Promise<IUserDocument | null> => {
        try {
            const user  = await User.findOne({email});
            if(user){
                return user;
            }
            return null
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error('An unknown error occurred'); 
            }        
        }
    }

    