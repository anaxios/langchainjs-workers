import { html } from "hono/html";
import { HtmlEscapedString } from "hono/utils/html";

export default function chatLayout() {
  return html`
    <div id="content" class=""></div>
    <input
      type="text"
      class="input input-bordered w-full max-w-xs"
      id="textBoxInputElement"
      hx-get="https://j3nkn5.cc/api/chat"
      hx-trigger="keydown[keyCode==13]"
      hx-target="#content"
      hx-indicator="#spinner"
      hx-swap="beforeend scroll:bottom transition:true"
      hx-vals='{"llm": "true", "vectors": "true"}'
      mustache-template="foo"
      name="query"
      placeholder="Type your question here."
    />
  `;
}
