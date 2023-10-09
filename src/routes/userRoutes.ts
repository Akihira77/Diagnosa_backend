import { Router } from "express";
import { register } from "../controllers/userController.js";

const routes = Router();

routes.post("/register", register);

export default routes;