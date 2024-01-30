import { Ai } from "@cloudflare/ai";
import type {
  VectorizeIndex,
  Fetcher,
  Request,
} from "@cloudflare/workers-types";

import { Hono } from "hono";

import { JSONObject } from "hono/utils/types";

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

const app = new Hono();

app.get("/", async (c) => {
  const url: string = c.req.query("url");
  const llm: string = c.req.query("model") || "@cf/microsoft/resnet-50";

  if (!url) {
    return;
  }

  const res: any = await fetch(url);
  const blob = await res.arrayBuffer();

  const ai = new Ai(c.env.AI);
  const inputs = {
    image: [...new Uint8Array(blob)],
  };

  const response = await ai.run(llm, inputs);
  console.log(response.status);

  const r = new Response(JSON.stringify({ inputs: { image: [] }, response }));
  return r;
});

export default app;
