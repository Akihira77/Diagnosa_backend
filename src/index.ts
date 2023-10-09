import dotenv from "dotenv";
import "express-async-error";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./data/connectDb.js";
import { StatusCodes } from "./utils/constant.js";
import userRoutes from "./routes/userRoutes.js";


dotenv.config();

const app = express();

//! Middleware`
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
    cors({
        origin: "*",
        methods: "*",
    })
);
app.use(morgan("dev"));

//! Routes

app.use("/api/v1", userRoutes);

app.all("*", (req, res) => {
    res.status(StatusCodes.NotFound404).send({
        msg: "Route does not match anything from server",
    });
    return;
});

const startServer = () => {
    const PORT = process.env.PORT || 7000;
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
};

connectDB().then(() => startServer());
