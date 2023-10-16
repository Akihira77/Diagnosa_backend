import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../utils/swagger.js";

const swaggerRoutes: Router = Router();

swaggerRoutes.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default swaggerRoutes;
