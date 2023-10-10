    import mongoose from "mongoose";
    import dotenv from "dotenv";

    dotenv.config();

    const connectDB = async () => {
        const MONGO_URI = process.env.MONGO_URI || "Missing URI";
        try {
            await mongoose.connect(MONGO_URI);
        } catch (error) {
            console.log("mongoDB error=> ", error);
            process.exit();
        }
    };

    export default connectDB;
