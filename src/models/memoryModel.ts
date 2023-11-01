import mongoose from "mongoose";

interface IMemorySchema {
	text: string;
}

const memorySchema = new mongoose.Schema<IMemorySchema>({
	text: { type: String, trim: true },
});

export const Memory = mongoose.model("memorydocuments", memorySchema);
