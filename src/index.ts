import { Hono } from "hono";
import { cors } from "hono/cors";
import { bearerAuth } from "hono/bearer-auth";
import api from "./routes/api/index";
import landing from "./routes/app/index";
import chat from "./routes/app/chat";
import calendar from "./routes/app/calendar";

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

app.route("/", landing);
app.route("/api", api);
app.route("/chat", chat);
app.route("/calendar", calendar);

export default app;
