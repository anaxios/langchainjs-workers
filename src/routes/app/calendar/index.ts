import { Hono } from "hono";
import { html, raw } from "hono/html";
import layout from "../../../layouts/layout";
import navbar from "../../../layouts/navbar";
import { HtmlEscapedString } from "hono/utils/html";

const app = new Hono();

async function getCalendar(date: Date) {
  // "https://www.holytrinityorthodox.com/calendar/calendar2.php?month=$month&today=$today&year=$year&dt=$dt&header=$header&lives=$lives&trp=$trp&scripture=$scripture"
  try {
    const today = date;
    const url = new URL(
      "https://www.holytrinityorthodox.com/calendar/calendar2.php"
    );
    url.searchParams.set("month", (today.getMonth() + 1).toString());
    url.searchParams.set("today", today.getDate().toString());
    url.searchParams.set("year", today.getFullYear().toString());
    url.searchParams.set("dt", "1");
    url.searchParams.set("header", "1");
    url.searchParams.set("lives", "1");
    url.searchParams.set("trp", "1");
    url.searchParams.set("scripture", "1");

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.text();
  } catch (error) {
    return `Error fetching data: ${error}`;
    // You can also re-throw the error or handle it as needed
    //throw error;
  }
}

async function calendarLayout() {
  return html`<p class="p-4">Server Time: ${new Date()}</p>
    <div
      id="get-cal"
      hx-trigger="load"
      hx-get="/calendar"
      hx-swap="innerHTML"
      hx-vals="js:{today: new Date().toLocaleString()}"
    ></div> `;
}

async function calCache(
  date: Date,
  c: Object
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const today = date.toISOString().split("T")[0];
  try {
    let data = await c.env.CALCACHE.get(today);

    if (!data) {
      data = await getCalendar(date);

      await c.env.CALCACHE.put(today, data, {
        expirationTtl: 60 * 60 * 24,
      });
    }
    return html`${raw(data)}`;
  } catch (e) {
    return html`${e}`;
  }
}

interface Env {
  calendar: KVNamespace;
}

app.get("/", async (c) => {
  const hxTrigger = c.req.header("HX-Trigger");
  const today = new Date(c.req.query("today")) ?? new Date();

  try {
    if (hxTrigger === "get-cal") {
      return c.html(
        html`<p class="p-4">Browser Time: ${today}</p>
          ${await calCache(today, c)}`
      );
      // return c.html(`${await c.env.calendar.get("test")}`);
    }
    return c.html(
      layout({
        navbar: navbar(),
        title: "Calendar",
        contents: calendarLayout(),
      })
    );
  } catch (e) {
    return c.html(e);
  }
});

export default app;
