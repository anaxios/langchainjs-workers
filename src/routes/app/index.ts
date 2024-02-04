import { Hono } from "hono";
import layout from "../../layouts/layout";
import landing from "../../layouts/landing";
import navbar from "../../layouts/navbar";
import chat from "./chat/index";

const app = new Hono();

app.get("/", (c) => {
  return c.html(
    layout({ navbar: navbar(), title: "J3NKN5.CC", contents: landing() })
  );
});

export default app;
