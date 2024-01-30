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

import { JSONObject } from "hono/utils/types";

export interface Env {
  VECTORIZE_INDEX: VectorizeIndex;
  AI: Fetcher;
  TOKEN: string;
}

type AIResponse = {
  vector?: JSONObject;
  query?: JSONObject;
};

const embed_model = "openai/text-embedding-ada-002";

const app = new Hono();

app.get("/", async (c) => {
  const query = c.req.query("query");
  const vector = c.req.query("vectors");
  const llm = c.req.query("model");

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: c.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
    batchSize: 512, // Default value if omitted is 512. Max is 2048
  });

  const store = new CloudflareVectorizeStore(embeddings, {
    index: c.env.VECTORIZE_INDEX,
  });

  const response: AIResponse = {};
  if (llm === "true") {
    const model = new TogetherAI({
      apiKey: c.env.TOGETHERAI_API_KEY,
      modelName: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      //modelName: "togethercomputer/llama-2-70b-chat",
      temperature: 0.1,
      maxTokens: 2048,
    });
    // RetrievalQAChain
    const chain = RetrievalQAChain.fromLLM(model, store.asRetriever(), {
      k: 2,
      returnSourceDocuments: true,
    });

    const res = await chain.invoke({
      query: query,
    });

    response.query = res.text;
  }

  if (vector === "true") {
    response.vector = await store.similaritySearch(query);
  }

  return c.json(response);
});

export default app;
