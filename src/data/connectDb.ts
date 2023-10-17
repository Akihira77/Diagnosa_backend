import mongoose from "mongoose";

const connectDB = async () => {
	const MONGO_URI = process.env.MONGO_URI || "Missing URI";
	try {
		await mongoose.connect(MONGO_URI);
		console.log(`DB Connected`);
	} catch (error) {
		console.log("mongoDB error=> ", error);
		process.exit();
	}
};

export default connectDB;
