import mongoose from "mongoose";

const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_URI || "Missing URI";
    console.log(MONGO_URI);
    try {
        await mongoose.connect(MONGO_URI);
    } catch (error) {
        console.log(error);
        process.exit();
    }
};

export default connectDB;
