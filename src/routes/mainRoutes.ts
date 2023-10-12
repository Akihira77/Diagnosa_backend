import { Router } from "express";
import userRoutes from "./userRoutes.js";

const routes: Router = Router();

routes.use("/api/v1/auth", userRoutes);

export default routes;
