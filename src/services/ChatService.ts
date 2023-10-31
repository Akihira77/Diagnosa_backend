import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MongoDBAtlasVectorSearch } from "langchain/vectorstores/mongodb_atlas";
import { Embedded, IEmbeddedSchema } from "../models/embeddedModel.js";
import createEmbedding, { embeddings } from "../utils/createEmbeddings.js";
import {
	BufferMemory,
	ConversationSummaryBufferMemory,
} from "langchain/memory";
import { MongoDBChatMessageHistory } from "langchain/stores/message/mongodb";
import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Memory } from "../models/memoryModel.js";
import {
	ChatPromptTemplate,
	HumanMessagePromptTemplate,
	MessagesPlaceholder,
	PromptTemplate,
	SystemMessagePromptTemplate,
} from "langchain/prompts";
import {
	RunnableSequence,
	RunnablePassthrough,
} from "langchain/schema/runnable";
import { StringOutputParser } from "langchain/schema/output_parser";
import { Document } from "langchain/document";
import { OpenAI } from "langchain/llms/openai";

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

		// const memory = new BufferMemory({
		// 	chatHistory: new MongoDBChatMessageHistory({
		// 		collection,
		// 		sessionId,
		// 	}),
		// 	returnMessages: true,
		// });

		const summaryModel = new OpenAI({
			openAIApiKey: process.env.OPENAI_API_KEY,
			temperature: 0,
			modelName: "gpt-3.5-turbo-16k",
		});

		const memory = new ConversationSummaryBufferMemory({
			llm: summaryModel,
			// maxTokenLimit: 50,
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

	// input: string,
	async generateAnswer(sessionId: string): Promise<any> {
		const answerTemplate = `Jawab pertanyaan hanya pada konteks berikut : {context}
		
		Pertanyaan: {question}`;
		const ANSWER_PROMPT = PromptTemplate.fromTemplate(answerTemplate);

		const promptTemplate = ChatPromptTemplate.fromMessages([
			[
				"system",
				"Kamu adalah sistem pendiagnosa penyakit yang baik, friendly sistem, tugasmu adalah memberikan output informasi solusi secara aktifitas dan medis dari keluhan yang diinputkan user, dan melanjutkan diskusi user dengan selalu bertanya ttg informasi tambahan hingga user berhenti bertanya. Tentunya karena kamu adalah sistem friendly yang super baik kamu tidak ingin membuat user bingung dengan banyak pertanyaan dalam satu waktu, jadi usahakan setiap respon darimu tidak terlalu banyak pertanyaan agar user awam dapat berkomunikasi dengan baik",
			],
			new MessagesPlaceholder("history"),
			["user", "{input}"],
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
			maxTokens: -1,
			streaming: true,
		});

		const chain = new ConversationChain({
			llm: model,
			memory,
			prompt: promptTemplate,
		});

		const formatChatHistory = (chatHistory: [string, string][]) => {
			const formattedDialogueTurns = chatHistory.map(
				(dialogueTurn) =>
					`Human: ${dialogueTurn[0]}\nAssistant: ${dialogueTurn[1]}`
			);
			return formattedDialogueTurns.join("\n");
		};

		type ConversationalRetrievalQAChainInput = {
			question: string;
			chat_history: [string, string][];
		};

		const standaloneQuestionChain = RunnableSequence.from([
			{
				question: (input: ConversationalRetrievalQAChainInput) =>
					input.question,
				chat_history: (input: ConversationalRetrievalQAChainInput) =>
					formatChatHistory(input.chat_history),
			},
			promptTemplate,
			model,
			new StringOutputParser(),
		]);

		const combineDocumentsFn = (docs: Document[], separator = "\n\n") => {
			const serializedDocs = docs.map((doc) => doc.pageContent);
			return serializedDocs.join(separator);
		};

		const retriever = this.vectorStore.asRetriever();

		const answerChain = RunnableSequence.from([
			{
				context: retriever.pipe(combineDocumentsFn),
				question: new RunnablePassthrough(),
			},
			ANSWER_PROMPT,
			model,
		]);

		const conversationalRetrievalQAChain =
			standaloneQuestionChain.pipe(answerChain);

		return conversationalRetrievalQAChain;
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
}

export default ChatService;
