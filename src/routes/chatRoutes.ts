import express from "express";
import * as chatController from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.get("/initialize", chatController.initialize);
chatRouter.get("/get-conversation", chatController.findConversationBySessionId);
chatRouter.post("/conversation", chatController.conversation);
// chatRouter.post("/insert-data", chatController.saveData);
// chatRouter.delete("/clean-data", chatController.cleanData);

export default chatRouter;
