import { Router } from "express";
import userRoutes from "./userRoutes.js";

const routes = Router();

routes.use("api/v1", userRoutes);

export default routes;