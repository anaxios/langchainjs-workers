import { html } from "hono/html";
import { HtmlEscapedString } from "hono/utils/html";

export default function landing() {
  return html`
    <div id="content" class="">
      <a href="/chat">AI CHAT (not exactly working) </a>
    </div>
  `;
}
