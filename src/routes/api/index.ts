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

const app = new Hono();

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
