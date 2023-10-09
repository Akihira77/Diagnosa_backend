import express, { Router } from "express";
import * as userController from "../controllers/userController.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const routes :Router = express();

routes.post("/register", userController.register);
routes.post("/login", authMiddleware ,userController.login);

export default routes;