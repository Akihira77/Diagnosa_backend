import { Request, Response } from "express";
import ChatService from "../services/ChatService.js";
import { StatusCodes } from "../utils/constant.js";
import { BadRequestError } from "../errors/main.error.js";
import { RunnableSequence } from "langchain/schema/runnable";
import { Document } from "langchain/document";
import { StringOutputParser } from "langchain/schema/output_parser";
import { BaseMessage } from "langchain/schema";
import mongoose from "mongoose";
// import data from "../../diagnosa.penyakits2.json" assert { type: "json" };

const saveData = async (req: Request, res: Response) => {
	const { name, description } = req.body;

	const chatService = new ChatService();

	await chatService.saveInformation(name, description);

	res.status(StatusCodes.Created201).send({ msg: "Information added" });
	return;
};

const seedData = async (req: Request, res: Response) => {
	// const chatService = new ChatService();

	// for (const item of data) {
	// 	await chatService.saveInformation(item.name, item.description);
	// }

	res.status(StatusCodes.Ok200).send({ msg: "Seed data success" });
	// return;
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
	const vectorStore = chatService.vectorStore;
	const memory = chatService.memoryInitialize(sessionId);
	const model = chatService.model;
	const CONVERSATION_PROMPT = chatService.promptInitialize();
	const retriever = vectorStore.asRetriever();

	try {
		const combineDocumentsFn = (
			docs: Document[],
			k: number | undefined,
			separator = ". "
		) => {
			let serializedDocs: string[] = [];
			if (k) {
				for (let i = 0; i < k; i++) {
					serializedDocs.push(docs[i].pageContent);
				}
			} else {
				serializedDocs = docs.map((doc) => doc.pageContent);
			}

			return serializedDocs.join(separator);
		};

		const formatChatHistory = (chatHistory: BaseMessage[]) => {
			const chatHistories = [];

			for (let i = 0; i < chatHistory.length; i++) {
				const content = chatHistory[i].content;

				chatHistories.push(content);
			}

			const result = chatHistories.join(". ");
			return result;
		};

		type InputConversation = {
			input: string;
			chat_history: BaseMessage[];
		};
		const conversationChain = RunnableSequence.from([
			{
				information: async (input: InputConversation) => {
					const resultSearch = await retriever.getRelevantDocuments(
						input.input
					);

					console.log(resultSearch);
					const result = combineDocumentsFn(resultSearch, 2);
					return result;
				},
				chat_history: (input: InputConversation) =>
					formatChatHistory(input.chat_history),
				input: (input: InputConversation) => input.input,
			},
			CONVERSATION_PROMPT,
			model,
			new StringOutputParser(),
		]);

		res.writeHead(StatusCodes.Ok200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
			"Access-Control-Allow-Origin": "*",
		});

		const stream = await conversationChain.stream({
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

export { saveData, seedData, cleanData, conversation, initialize };
