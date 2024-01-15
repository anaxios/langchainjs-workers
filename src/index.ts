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
import { TogetherAI } from "@langchain/community/llms/togetherai"
import { RetrievalQAChain } from "langchain/chains";

import { Hono } from "hono";
import { bearerAuth } from 'hono/bearer-auth'
const app = new Hono();
const token = 'yourmom';

export interface Env {
  VECTORIZE_INDEX: VectorizeIndex;
  AI: Fetcher;
}

type Environment = {
  readonly MY_QUEUE: Queue;
};

const embed_model = "openai/text-embedding-ada-002";

app.use('/input/*', bearerAuth({ token }));

app.get('/', async (c) => {
  const query = c.req.query('q');

  // const loader = new CheerioWebBaseLoader(
  //     "https://en.wikipedia.org/wiki/Brooklyn"
  // );
  // const docs = await loader.loadAndSplit();
  // console.log(docs);

  // const embeddings = new CloudflareWorkersAIEmbeddings({
  //   binding: c.env.AI,
  //   modelName: embed_model,
  // });

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: c.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
    batchSize: 512, // Default value if omitted is 512. Max is 2048
  });

  const store = new CloudflareVectorizeStore(embeddings, {
    index: c.env.VECTORIZE_INDEX,
  });

  const model = new TogetherAI({
    apiKey: c.env.TOGETHERAI_API_KEY,
    //modelName: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    modelName: "togethercomputer/llama-2-70b-chat",
    temperature: 0.5,

  });

  const chain = RetrievalQAChain.fromLLM(model, store.asRetriever());

  const res = await chain.invoke({
      query: query,
  });

  console.log(res.text);

  return c.text(res.text);

});


app.post('/input', async (c) => {
  const data = await c.req.json();

  // const loader = new CheerioWebBaseLoader(
  //     res
  // );
  // const docs = await loader.loadAndSplit();
  // console.log(docs);
  
  // const embeddings = new CloudflareWorkersAIEmbeddings({
  //   binding: c.env.AI,
  //   modelName: embed_model,
  // });

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: c.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
    batchSize: 512, // Default value if omitted is 512. Max is 2048
  });

  const store = new CloudflareVectorizeStore(embeddings, {
    index: c.env.VECTORIZE_INDEX,
  });

  // Load the docs into the vector store
  // c.executionCtx.waitUntil(await store.addDocuments(docs)); 
  //   await env.MY_QUEUE.send({
  //     url: req.url,
  //     method: req.method,
  //     headers: Object.fromEntries(req.headers),
  //   });

  c.executionCtx.waitUntil(await store.addDocuments(
    data[0],data[1]
  ));



  return c.text(data);

});

app.get('/vector', async (c) => {
  const query = c.req.query('get');
  
  // const embeddings = new CloudflareWorkersAIEmbeddings({
  //   binding: c.env.AI,
  //   modelName: embed_model,
    
  // });

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: c.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
    batchSize: 512, // Default value if omitted is 512. Max is 2048
  });

  const store = new CloudflareVectorizeStore(embeddings, {
    index: c.env.VECTORIZE_INDEX,
  });

  // Load the docs into the vector store
  const results = await store.similaritySearch(query, 20);
  console.log(results);
  return c.text(JSON.stringify(results));

});

export default app;



// export default {
  //   async fetch(request: Request, env: Env) {
//     const { pathname } = new URL(request.url);
//     const embeddings = new CloudflareWorkersAIEmbeddings({
//       binding: env.AI,
//       modelName: "@cf/baai/bge-large-en-v1.5",
//     });
//     const store = new CloudflareVectorizeStore(embeddings, {
//       index: env.VECTORIZE_INDEX,
//     });
//     if (pathname === "/") {
//       const results = await store.similaritySearch("hello", 5);
//       return Response.json(results);
//     } else if (pathname === "/load") {
//       // Upsertion by id is supported
//       await store.addDocuments(
        // [
        //   {
        //     pageContent: "hello",
        //     metadata: {},
        //   },
        //   {
        //     pageContent: "world",
        //     metadata: {},
        //   },
        //   {
        //     pageContent: "hi",
        //     metadata: {},
        //   },
        // ],
        // { ids: ["id1", "id2", "id3"] }
//       );

//       return Response.json({ success: true });
//     } else if (pathname === "/clear") {
//       await store.delete({ ids: ["id1", "id2", "id3"] });
//       return Response.json({ success: true });
//     }

//     return Response.json({ error: "Not Found" }, { status: 404 });
//   },
// };