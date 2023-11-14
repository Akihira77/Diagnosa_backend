import { BaseMessage } from "langchain/schema";
import { MongoDBAtlasVectorSearch } from "langchain/vectorstores/mongodb_atlas";
import { Embedded, IEmbeddedSchema } from "../models/embeddedModel.js";
import createEmbedding, { embeddings } from "../utils/createEmbeddings.js";
import { ConversationSummaryBufferMemory } from "langchain/memory";
import { MongoDBChatMessageHistory } from "langchain/stores/message/mongodb";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Memory } from "../models/memoryModel.js";
import {
	ChatPromptTemplate,
	HumanMessagePromptTemplate,
	SystemMessagePromptTemplate,
} from "langchain/prompts";
import { RunnableSequence } from "langchain/schema/runnable";
import { StringOutputParser } from "langchain/schema/output_parser";
import { Document } from "langchain/document";
import { OpenAI } from "langchain/llms/openai";

export type InputConversation = {
	input: string;
	chat_history: BaseMessage[];
};

class ChatService {
	readonly vectorStore;
	readonly embeddedCollection;
	readonly model;
	constructor() {
		this.embeddedCollection = Embedded.collection;
		this.vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
			collection: this.embeddedCollection,
			indexName: "default",
			textKey: "description",
			embeddingKey: "embedding",
		});

		this.model = new ChatOpenAI({
			modelName: "gpt-4",
			temperature: 0.9,
			maxTokens: -1,
			streaming: true,
			openAIApiKey: process.env.OPENAI_API_KEY,
		});
	}

	memoryInitialize(sessionId: string) {
		const collection = Memory.collection;

		const summaryModel = new OpenAI({
			openAIApiKey: process.env.OPENAI_API_KEY,
			temperature: 0,
			modelName: "gpt-3.5-turbo-16k",
		});

		const memory = new ConversationSummaryBufferMemory({
			llm: summaryModel,
			returnMessages: true,
			chatHistory: new MongoDBChatMessageHistory({
				collection,
				sessionId,
			}),
		});

		return memory;
	}

	promptInitialize() {
		const conversationTemplate = `Kamu adalah AI asisten pendiagnosa penyakit yang baik dan bersahabat kamu hanya bertanggung jawab untuk bercakap dengan user tentang penyakit atau tentang kesehatan selain itu katakan saja tentang siapa dirimu dan apa tugasmu kepada pasien. 
Tugasmu adalah berdiskusi dengan user dengan terus memberikan pertanyaan kepada user yang bertujuan untuk mengumpulkan informasi keluhan user. Karena user adalah orang yang sedang sakit maka JANGAN memberikan pertanyaan yang berlebihan dalam satu percakapan (ingat kamu adalah asisten yang baik dan bersahabat)
Jika informasi dari user dan dari developer cukup bagimu untuk memberikan jawaban terkait hasil final/sementara diagnosa dari semua keluhan user, maka berikan kesimpulan atas keluhan user, solusi berupa kegiatan yang baik untuk dilakukan dan yang sebaiknya dihindari, lalu solusi berupa medis atau obat apa yang sebaiknya dikonsumsi. Jika belum cukup maka teruskan pertanyaan kepada user untuk mengumpulkan informasi.
Setelah itu semua tanyakan apakah user masih memiliki keluhan,
jika iya maka teruskan diskusi seperti sebelumnya,
jika tidak atau user sudah menyampaikan semua keluhannya maka kamu dapat memberikan respon yang sama seperti sebelumnya namun lebih lengkap dan penutup berupa saran dan kalimat yang baik untuk diucapkan kepada user.

Developer akan memberikan informasi yang berkaitan dengan informasi dari pasien untuk menambah informasi yang kamu butuhkan untuk menjawab pasien 
{information}

Akan disediakan juga riwayat diskusi antara dirimu AI dan Pasien untuk menambah informasi yang dibutuhkan untukmu
{chat_history}`;

		const CONVERSATION_PROMPT = ChatPromptTemplate.fromMessages([
			SystemMessagePromptTemplate.fromTemplate(conversationTemplate),
			HumanMessagePromptTemplate.fromTemplate("{input}"),
		]);

		return CONVERSATION_PROMPT;
	}

	async conversation(): Promise<RunnableSequence<InputConversation, string>> {
		const CONVERSATION_PROMPT = this.promptInitialize();
		const retriever = this.vectorStore.asRetriever();

		const conversationChain = RunnableSequence.from([
			{
				information: async ({ input }: InputConversation) => {
					const resultSearch = await retriever.getRelevantDocuments(
						input,
					);

					// console.log(resultSearch);
					const result = this.combineDocumentsFn(resultSearch, 2);
					return result;
				},
				chat_history: ({ chat_history }: InputConversation) =>
					this.formatChatHistory(chat_history),
				input: ({ input }: InputConversation) => input,
			},
			CONVERSATION_PROMPT,
			this.model,
			new StringOutputParser(),
		]);

		return conversationChain;
	}

	formatChatHistory(chatHistory: BaseMessage[]) {
		const chatHistories = [];

		for (let i = 0; i < chatHistory.length; i++) {
			const content = chatHistory[i].content;

			chatHistories.push(content);
		}

		const result = chatHistories.join(". ");
		return result;
	}

	combineDocumentsFn(
		docs: Document[],
		k: number | undefined,
		separator = ". ",
	) {
		let serializedDocs: string[] = [];
		if (k) {
			for (let i = 0; i < k; i++) {
				serializedDocs.push(docs[i].pageContent);
			}
		} else {
			serializedDocs = docs.map((doc) => doc.pageContent);
		}

		return serializedDocs.join(separator);
	}

	async saveInformation(name: string, description: string): Promise<unknown> {
		const embedding = await createEmbedding(description);

		if (embedding.length == 0) return;

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

	async findSimilarDocuments(embedding: number[]): Promise<void> {
		const documents = await Embedded.aggregate([
			{
				$search: {
					knnBeta: {
						vector: embedding,
						// path is the path to the embedding field in the mongodb collection documentupload
						path: "embedding",
						// change k to the number of documents you want to be returned
						k: 5,
					},
				},
			},
			{
				$project: {
					description: 1,
					score: { $meta: "searchScore" },
				},
			},
		]);

		console.log(documents);
	}

	async deleteChatHistoryById(id: string): Promise<boolean> {
		const result = await Memory.findByIdAndDelete(id);

		return Boolean(result);
	}
}

export default ChatService;
