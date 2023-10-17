import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export const embeddings = new OpenAIEmbeddings({
	openAIApiKey: process.env.OPENAI_API_KEY,
});

const createEmbedding = async (text: string) => {
	const [embeddingResponse] = await embeddings.embedDocuments([text]);
	return embeddingResponse;
};

export default createEmbedding;
