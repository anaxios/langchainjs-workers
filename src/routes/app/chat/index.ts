import { Hono } from "hono";
import layout from "../../../layouts/layout";
import chatLayout from "../../../layouts/chatLayout";
import navbar from "../../../layouts/navbar";

const app = new Hono();

async function getSearch(query: string) {
  try {
    const url = new URL("https://j3nkn5.cc/api/chat");
    url.searchParams.set("query", "query");
    url.searchParams.set("vectors", "true");

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    return `Error fetching data: ${error}`;
    // You can also re-throw the error or handle it as needed
    //throw error;
  }
}

app.get("/", async (c) => {
  const query = c.req.query("query");
  if (query) {
    return c.html(getSearch(query));
  }
  return c.html(
    layout({ navbar: navbar(), title: "AI Chat", contents: chatLayout() })
  );
});

export default app;
