import { createFileRoute } from "@tanstack/react-router";
import { render } from "@react-email/render";
import { createElement } from "react";
import { TEMPLATES } from "@/lib/email-templates/registry";

export const Route = createFileRoute("/lovable/email/transactional/preview")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!process.env["LOVABLE_API_KEY"]) return new Response("Not found", { status: 404 });
        const url = new URL(request.url);
        const name = url.searchParams.get("template");
        if (!name) {
          const links = Object.entries(TEMPLATES)
            .map(([key, t]) => `<li><a href="?template=${key}">${t.displayName ?? key}</a></li>`)
            .join("");
          return new Response(`<ul>${links}</ul>`, { headers: { "content-type": "text/html" } });
        }
        const entry = TEMPLATES[name];
        if (!entry) return new Response("Unknown template", { status: 404 });
        const html = await render(createElement(entry.component, entry.previewData ?? {}));
        return new Response(html, { headers: { "content-type": "text/html" } });
      },
    },
  },
  component: () => null,
});
