import { Hono } from "hono";
import layout from "../../../layouts/layout";
import chatLayout from "../../../layouts/chatLayout";

const app = new Hono();

app.get("/", (c) => {
  return c.html(layout({ title: "AI Chat", contents: chatLayout() }));
});

export default app;
