import { Schema, model } from "mongoose";
import { ITokenDocument } from "../@types/interfaces.js";
import { User } from "./userModel.js";

export const TokenSchema = new Schema<ITokenDocument>({
	userId: { type: Schema.Types.ObjectId, required: true, ref: User },
	token: { type: String, required: true },
	createdAt: { type: Date, default: Date.now, expires: 3600 },
});

export const Token = model<ITokenDocument>("Token", TokenSchema);
