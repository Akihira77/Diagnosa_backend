import express, { Router } from "express";
import * as userController from "../controllers/userController.js";

const routes :Router = express();

routes.post("/register", userController.register);
routes.post("/login", userController.login);

export default routes;