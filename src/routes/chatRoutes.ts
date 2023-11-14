import express from "express";
import * as chatController from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.get("", chatController.getConversationsByEmail);
chatRouter.get("/initialize", chatController.initialize);
chatRouter.get("/get-conversation", chatController.findConversationBySessionId);
chatRouter.post("/conversation", chatController.conversation);
chatRouter.delete(
	"/delete-chat-history/:sessionId",
	chatController.deleteChatHistoryBySessionId,
);
chatRouter.delete("/clean-memory", chatController.cleanMemory);
// chatRouter.post("/insert-data", chatController.saveData);
// chatRouter.delete("/clean-data", chatController.cleanData);

export default chatRouter;
