import express, { Router } from "express";
import * as userController from "../controllers/userController.js";

const userRoutes:Router = express();

userRoutes.post("/register", userController.register);

export default userRoutes;