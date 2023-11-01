import { Schema, model } from "mongoose";
import { ITokenDocument } from "../@types/interfaces.js";

export const TokenSchema = new Schema<ITokenDocument>({
	userId: { type: Schema.Types.ObjectId, required: true, ref: "user" },
	token: { type: String, required: true },
	createdAt: { type: Date, default: Date.now, expires: 3600 },
});

export const Token = model<ITokenDocument>("Token", TokenSchema);
