import { html } from "hono/html";
import { HtmlEscapedString } from "hono/utils/html";

export default function landing({
  navbar,
  title,
  contents,
}: {
  navbar: HtmlEscapedString | Promise<HtmlEscapedString>;
  title: string;
  contents: HtmlEscapedString | Promise<HtmlEscapedString>;
}) {
  return html`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://cdn.jsdelivr.net/npm/daisyui@4.6.0/dist/full.min.css"
          rel="stylesheet"
          type="text/css"
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            // add daisyUI plugin
            plugins: [require("@tailwindcss/typography"), require("daisyui")],

            // daisyUI config (optional - here are the default values)
            daisyui: {
              themes: ["business"], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
              darkTheme: "business", // name of one of the included themes for dark mode
              base: true, // applies background color and foreground color for root element by default
              styled: true, // include daisyUI colors and design decisions for all components
              utils: true, // adds responsive and modifier utility classes
              prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
              logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
              themeRoot: ":root", // The element that receives theme color CSS variables
            },
          };
        </script>
        <script
          src="https://unpkg.com/htmx.org@1.9.10"
          integrity="sha384-D1Kt99CQMDuVetoL1lrYwg5t+9QdHe7NLX/SoJYkXDFfX37iInKRy5xLSi8nO7UC"
          crossorigin="anonymous"
        ></script>
        <title>${title}</title>
      </head>
      <body htmx-boost="true">
        ${navbar}
        <h1 class="text-4xl w-screen text-center">${title}</h1>
        ${contents}
      </body>
    </html>
  `;
}
