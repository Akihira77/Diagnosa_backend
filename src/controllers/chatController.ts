import { Request, Response } from "express";
import ChatService from "../services/ChatService.js";
import { StatusCodes } from "../utils/constant.js";
import { BadRequestError } from "../errors/main.error.js";
import mongoose from "mongoose";

const saveData = async (req: Request, res: Response) => {
	const { name, description } = req.body;

	const chatService = new ChatService();

	await chatService.saveInformation(name, description);

	res.status(StatusCodes.Created201).send({ msg: "Information added" });
	return;
};

const cleanData = async (req: Request, res: Response) => {
	const chatService = new ChatService();

	await chatService.cleanData();
	res.status(StatusCodes.Ok200).send({ msg: "Data Cleaned" });
	return;
};

const initialize = async (req: Request, res: Response) => {
	const sessionId = new mongoose.mongo.ObjectId().toString();

	res.status(StatusCodes.Ok200).send({ sessionId });
	return;
};

const conversation = async (
	req: Request<never, never, { input: string; sessionId: string }, never>,
	res: Response
) => {
	const { input, sessionId } = req.body;
	if (!sessionId || sessionId === "") {
		throw new BadRequestError("SessionId must provided");
	}

	const chatService = new ChatService();
	const memory = chatService.memoryInitialize(sessionId);
	const chain = await chatService.conversation();

	try {
		res.writeHead(StatusCodes.Ok200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
			"Access-Control-Allow-Origin": "*",
		});

		const stream = await chain.stream({
			input,
			chat_history: await memory.chatHistory.getMessages(),
		});

		let streamedResult = "";
		for await (const chunk of stream) {
			streamedResult += chunk;
			res.write(chunk);
		}

		await memory.saveContext(
			{ input },
			{
				output: streamedResult,
			}
		);

		res.end();
		return;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export { saveData, cleanData, conversation, initialize };
