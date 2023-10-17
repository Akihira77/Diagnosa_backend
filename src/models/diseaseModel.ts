import mongoose from "mongoose";

export interface IDiseaseSchema {
	nama: string;
	deskripsi: string;
	penyebab: string;
	faktorRisiko: string;
	gejala: string;
	keDokter: string;
	diagnosis: string;
	pengobatan: string;
	pencegahan: string;
}

const diseaseSchema = new mongoose.Schema<IDiseaseSchema>({
	nama: { type: String, trim: true },
	deskripsi: { type: String, trim: true },
	penyebab: { type: String, trim: true },
	faktorRisiko: { type: String, trim: true },
	gejala: { type: String, trim: true },
	keDokter: { type: String, trim: true },
	diagnosis: { type: String, trim: true },
	pengobatan: { type: String, trim: true },
	pencegahan: { type: String, trim: true },
});

export const Disease = mongoose.model("Disease", diseaseSchema);
