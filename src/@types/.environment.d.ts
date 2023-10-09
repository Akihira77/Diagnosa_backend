export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string ;
            MONGO_URI: string;
            JWT_SECRET: string;
            OPENAI_API_KEY: string;
        }
    }
}
