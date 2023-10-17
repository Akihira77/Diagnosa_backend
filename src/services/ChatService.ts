import { MongoDBAtlasVectorSearch } from "langchain/vectorstores/mongodb_atlas";
import { Embedded, IEmbeddedSchema } from "../models/embeddedModel.js";
import createEmbedding, { embeddings } from "../utils/createEmbeddings.js";
import { BufferMemory } from "langchain/memory";
import { MongoDBChatMessageHistory } from "langchain/stores/message/mongodb";
import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Memory } from "../models/memoryModel.js";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { ChainValues } from "langchain/schema";

class ChatService {
	private constructor(
		private readonly vectorStore: MongoDBAtlasVectorSearch
	) {}

	static async initialize() {
		const collection = Embedded.collection;
		const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
			collection: collection,
			indexName: "default",
			textKey: "description",
			embeddingKey: "embedding",
		});

		return new ChatService(vectorStore);
	}

	async generateAnswer(
		input: string,
		sessionId: string
	): Promise<ChainValues> {
		const promptTemplate = ChatPromptTemplate.fromMessages([
			[
				"system",
				"Kamu adalah sistem pendiagnosa penyakit yang baik, friendly sistem, tugasmu adalah memberikan output informasi solusi secara aktifitas dan medis dari keluhan yang diinputkan user, dan melanjutkan diskusi user dengan selalu bertanya ttg informasi tambahan hingga user berhenti bertanya. Tentunya karena kamu adalah sistem friendly yang super baik kamu tidak ingin membuat user bingung dengan banyak pertanyaan dalam satu waktu, jadi usahakan setiap respon darimu tidak terlalu banyak pertanyaan agar user awam dapat berkomunikasi dengan baik",
			],
			new MessagesPlaceholder("history"),
			["human", "{input}"],
		]);

		const collection = Memory.collection;

		const memory = new BufferMemory({
			chatHistory: new MongoDBChatMessageHistory({
				collection,
				sessionId,
			}),
		});

		const model = new ChatOpenAI({
			modelName: "gpt-3.5-turbo-16k",
			temperature: 0.9,
		});

		const chain = new ConversationChain({
			llm: model,
			memory,
			prompt: promptTemplate,
		});

		const response = await chain.call({
			input: input,
		});

		return response;
	}

	async saveInformation(name: string, description: string): Promise<unknown> {
		const embedding = await createEmbedding(description);

		const newDoc: IEmbeddedSchema = {
			name,
			description,
			embedding: embedding,
		};
		return await Embedded.create(newDoc);
	}

	async cleanData(): Promise<void> {
		await Embedded.deleteMany({});
	}
}

export default ChatService;
