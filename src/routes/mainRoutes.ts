import { Router } from "express";
import userRoutes from "./userRoutes.js";
import swaggerRoutes from "./swaggerRoutes.js"

const routes: Router = Router();

routes.use("/api/v1/auth", userRoutes);
routes.use("/api/v1/api-docs", swaggerRoutes); 

export default routes;
