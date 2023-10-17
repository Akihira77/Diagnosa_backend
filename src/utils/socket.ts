import uWS from "uWebSockets.js";
import ChatService from "../services/ChatService.js";

import { StringDecoder } from "string_decoder";
import mongoose from "mongoose";
const decoder = new StringDecoder("utf-8");

export const startSocket = async () => {
	const chatInit = await ChatService.initialize();
	let sessionId: string = "";
	const ws = uWS.App().ws("/api/ws", {
		// Options
		compression: 0,
		maxPayloadLength: 16 * 1024 * 1024,
		idleTimeout: 10,
		maxBackpressure: 64 * 1024,

		// Handler
		open: (ws) => {
			console.log(`${new Date().toDateString()} User connected socket`);
			sessionId = new mongoose.mongo.ObjectId().toString();
		},
		message: (ws, message, isBinary) => {
			const text = decoder.write(Buffer.from(message));
			console.log(`user text: ${text}`);
			chatInit.generateAnswer(text, sessionId).then((result) => {
				// console.log(result);
				ws.send(result.response, isBinary, true);
			});
		},
		drain: (ws) => {
			console.log("WebSocket backpressure: " + ws.getBufferedAmount());
		},
		close: (ws, code, message) => {
			console.log(`${new Date().toDateString()} WebSocket closed`);
		},
	});

	const port = Number(process.env.WS_PORT || 7071);
	ws.listen(port, (listenSocket) => {
		if (listenSocket) {
			console.log(`Socket listening to port ${port}`);
		} else {
			console.log(`Failed to listen to port ${port}`, listenSocket);
		}
	});
};
