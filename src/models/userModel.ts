import { Schema, model} from "mongoose";
import bcrypt from "bcryptjs";
import { IUserDocument } from "../@types/interfaces.js";

const UserSchema = new Schema<IUserDocument>(
	{
		email: { 
			type: String, 
			required: true, 
			unique: true ,
			validate: {
				validator: (email:string) => {
					const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					return regex.test(email);
				},
				message: "Please enter a valid email",
			}
		},
		password: { 
      type: String, 
      required: true, 
      validate: {
        validator: (password:string) => {
          const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})/;
          return regex.test(password);
        }
      }
    },
	},
	{ timestamps: true }
);

UserSchema.pre("save", async function (next) {
	if(!this.isModified("password")) {
		return next();
}
	const hash = await bcrypt.hash(this.password, Number(process.env.BCRYPT_SALT));
	this.password = hash;
	next();
});

export const User = model<IUserDocument>("User", UserSchema);