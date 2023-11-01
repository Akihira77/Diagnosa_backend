import mongoose from "mongoose";

export interface IEmbeddedSchema {
	name: string;
	description: string;
	embedding: number[];
}

const embeddedSchema = new mongoose.Schema<IEmbeddedSchema>({
	name: { type: String, required: true, trim: true },
	description: { type: String, required: true, trim: true },
	embedding: { type: [Number] },
});

export const Embedded = mongoose.model("embeddocuments", embeddedSchema);
