import { Hono } from "hono";
import layout from "../../layouts/layout";
import landing from "../../layouts/landing";
import chat from "./chat/index";

const app = new Hono();

app.get("/", (c) => {
  return c.html(layout({ title: "J3NKN5.CC ][", contents: landing() }));
});

export default app;
