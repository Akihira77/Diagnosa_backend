import mongoose from "mongoose";
import { User } from "./userModel.js";

interface IMessageSchema {
	type: string;
	data: object;
}
interface IMemorySchema {
	userId: mongoose.Schema.Types.ObjectId;
	email: string;
	messages: IMessageSchema[];
}

const messageSchema = new mongoose.Schema<IMessageSchema>({
	type: { type: String },
	data: { type: Object },
});

const memorySchema = new mongoose.Schema<IMemorySchema>({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: User },
	email: { type: String, trim: true },
	messages: [{ type: messageSchema }],
});

export const Memory = mongoose.model("memorydocuments", memorySchema);
