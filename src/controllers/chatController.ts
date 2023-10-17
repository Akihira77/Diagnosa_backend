import { Request, Response } from "express";
import ChatService from "../services/ChatService.js";
import { StatusCodes } from "../utils/constant.js";
// import data from "../../diagnosa.penyakits.json" assert { type: "json" };

const saveData = async (req: Request, res: Response) => {
	const { name, description } = req.body;

	const chatInit = await ChatService.initialize();

	await chatInit.saveInformation(name, description);

	res.status(StatusCodes.Created201).send({ msg: "Information added" });
	return;
};

const seedData = async (req: Request, res: Response) => {
	// const chatInit = await ChatService.initialize();

	// for (const item of data) {
	// 	let text: string = "";
	// 	Object.entries(item).map((obj) => {
	// 		if (obj[0] != "_id" && obj[0] != "__v" && obj[0] != "nama") {
	// 			// console.log(obj);
	// 			text += obj[1];
	// 		}
	// 	});
	// 	await chatInit.saveInformation(item.nama, text);
	// }

	res.status(StatusCodes.Ok200).send({ msg: "Seed data success" });
	return;
};

const cleanData = async (req: Request, res: Response) => {
	const chatInit = await ChatService.initialize();

	await chatInit.cleanData();
	res.status(StatusCodes.Ok200).send({ msg: "Data Cleaned" });
	return;
};

export { saveData, seedData, cleanData };
