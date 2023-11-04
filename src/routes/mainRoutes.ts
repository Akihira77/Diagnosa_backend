import { Router } from "express";
import userRoutes from "./userRoutes.js";
import chatRoutes from "./chatRoutes.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const routes: Router = Router();

routes.use("/api/v1/auth", userRoutes);
routes.use("/api/v1/chat", authMiddleware, chatRoutes);

export default routes;
