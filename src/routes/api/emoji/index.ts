import type { VectorizeIndex, Fetcher } from "@cloudflare/workers-types";
import { TogetherAI } from "@langchain/community/llms/togetherai";
import { PromptTemplate } from "langchain/prompts";
import { Hono } from "hono";
import { JSONObject } from "hono/utils/types";

const app = new Hono();

const Emoji = /\p{Extended_Pictographic}/u;

function filterEmoji(t: string) {
  const emojiArray = Array.from(t).filter((e) => Emoji.test(e));
  return [...new Set(emojiArray)].join("");
}

app.get("/", async (c) => {
  const query: string = c.req.query("query") || "";
  const temp: number = parseFloat(c.req.query("temp") || "0.5");
  const llm: string =
    c.req.query("model") || "togethercomputer/llama-2-70b-chat";

  console.log(`query: ${query}`, `temp: ${temp} model: ${llm}`);

  if (query) {
    const apiKey = c.env?.TOGETHERAI_API_KEY as string;

    if (!apiKey) {
      // Handle the case where the API key is not provided
      return c.json({ error: "API key is required" }, 400);
    }

    const model = new TogetherAI({
      apiKey: apiKey,
      modelName: llm,
      temperature: temp,
      maxTokens: 128,
    });

    const prompt = PromptTemplate.fromTemplate(
      `Describe the following with a couple emoji: {question}`
    );

    const runnable = prompt.pipe(model);

    const response = await runnable.invoke({ question: query });

    console.log(response);

    return c.text(filterEmoji(response));
  }
});

export default app;
