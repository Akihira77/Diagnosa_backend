    import mongoose from "mongoose";
    import dotenv from "dotenv";

    dotenv.config();

    const connectDB = async () => {
        const MONGO_URI = process.env.MONGO_URI || "Missing URI";
        console.log("Mongo_URI:",MONGO_URI);
        try {
            await mongoose.connect(MONGO_URI);
            console.log("MongoDB running:", MONGO_URI);
        } catch (error) {
            console.log("mongoDB error=> ", error);
            process.exit();
        }
    };

    export default connectDB;
