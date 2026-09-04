import { createFileRoute } from "@tanstack/react-router";

const MODEL = "google/gemini-3.1-flash-image";

const PROMPT = [
  "Retusche dieses Foto zu einem professionellen Bewerbungsfoto (Business-Portrait).",
  "Behalte das Gesicht, die Identität und die Gesichtszüge exakt bei – keine Veränderung der Person.",
  "Verbessere Belichtung, Schärfe, Farbbalance und Hautbild natürlich, entferne Bildrauschen.",
  "Ersetze den Hintergrund durch einen dezenten, gleichmäßigen hellgrauen Studiohintergrund.",
  "Zuschnitt als Portrait (Kopf und Schultern), zentriert, hochkant im Verhältnis 3:4.",
  "Kein Text, keine Rahmen, keine Wasserzeichen.",
].join(" ");

export const Route = createFileRoute("/api/enhance-photo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        let image: string | undefined;
        try {
          ({ image } = (await request.json()) as { image?: string });
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        if (!image || !image.startsWith("data:image/")) {
          return new Response("Missing image", { status: 400 });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: PROMPT },
                  { type: "image_url", image_url: { url: image } },
                ],
              },
            ],
            modalities: ["image", "text"],
          }),
        });

        if (!upstream.ok) {
          const text = await upstream.text().catch(() => "");
          return new Response(text || "AI request failed", { status: upstream.status });
        }

        const payload = (await upstream.json()) as {
          data?: Array<{ b64_json?: string; url?: string }>;
        };
        const first = payload.data?.[0];
        const result = first?.b64_json
          ? `data:image/png;base64,${first.b64_json}`
          : first?.url;

        if (!result) return new Response("No image returned", { status: 502 });

        return new Response(JSON.stringify({ image: result }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
