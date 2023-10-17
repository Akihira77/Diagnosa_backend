import { Router } from "express";
import userRoutes from "./userRoutes.js";
import chatRoutes from "./chatRoutes.js";

const routes: Router = Router();

routes.use("/api/v1/auth", userRoutes);
routes.use("/api/v1/chat", chatRoutes);

export default routes;
