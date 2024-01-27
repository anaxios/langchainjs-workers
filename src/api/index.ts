/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.js` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.js --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
// import { OpenAI } from "langchain/llms/openai";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// import { RetrievalQAChain } from "langchain/chains";

// export default {
//     async fetch(request, env, ctx) {
//         const loader = new CheerioWebBaseLoader(
//             "https://en.wikipedia.org/wiki/Brooklyn"
//         );
//         const docs = await loader.loadAndSplit();
//         console.log(docs);

//         const store = await MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings({ openAIApiKey: env.OPENAI_API_KEY}));

//         const model = new OpenAI({ openAIApiKey: env.OPENAI_API_KEY });
//         const chain = RetrievalQAChain.fromLLM(model, store.asRetriever());

//         const { searchParams } = new URL(request.url);
//         const question = searchParams.get('question') ?? "What is this article about? Can you give me 3 facts about it?";

//         const res = await chain.call({
//             query: question,
//         });
//         console.log(res.text);

//         return new Response(res.text);
//     },
// };

// @ts-nocheck

import { Ai } from "@cloudflare/ai";
import type {
  VectorizeIndex,
  Fetcher,
  Request,
} from "@cloudflare/workers-types";

import {
  CloudflareVectorizeStore,
  CloudflareWorkersAIEmbeddings,
} from "@langchain/cloudflare";

import { OpenAIEmbeddings } from "@langchain/openai";

import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { TogetherAI } from "@langchain/community/llms/togetherai";
import { RetrievalQAChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

import { Hono } from "hono";
import { cors } from "hono/cors";
import { bearerAuth } from "hono/bearer-auth";

const app = new Hono();

import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { JSONObject } from "hono/utils/types";
import emoji from "./emoji";
import chat from "./chat";
import img from "./img";

export interface Env {
  VECTORIZE_INDEX: VectorizeIndex;
  AI: Fetcher;
  TOKEN: string;
}

type Environment = {
  readonly MY_QUEUE: Queue;
};

type AIResponse = {
  vector?: JSONObject;
  query?: JSONObject;
};

const token = "yourmom";
const embed_model = "openai/text-embedding-ada-002";

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["*"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 6000,
    credentials: false,
  })
);

app.route("/emoji", emoji);
app.route("/chat", chat);
app.route("/img", img);

export default app;
