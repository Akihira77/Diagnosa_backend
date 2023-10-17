export {};

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: string;
			WS_PORT: string;
			MONGO_URI: string;
			JWT_SECRET: string;
			OPENAI_API_KEY: string;
			ACCESS_TOKEN: string; // for jwt (ex: 1h, 10d)
			REFRESH_TOKEN: string; // for jwt (ex: 1h, 10d)
		}
	}
}
