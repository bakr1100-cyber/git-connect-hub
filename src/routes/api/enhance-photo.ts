import { createFileRoute } from "@tanstack/react-router";

const MODEL = "google/gemini-3.1-flash-image";
/** Stronger model used as a second attempt for difficult photos. */
const FALLBACK_MODEL = "google/gemini-3-pro-image";

interface Hints {
  dark?: boolean;
  blurry?: boolean;
}

function buildPrompt(hints: Hints): string {
  const parts = [
    "Retusche dieses Foto zu einem professionellen Bewerbungsfoto (Business-Portrait).",
    "Behalte das Gesicht, die Identität und die Gesichtszüge exakt bei – keine Veränderung der Person.",
    "Verbessere Belichtung, Schärfe, Farbbalance und Hautbild natürlich, entferne Bildrauschen.",
    "Ersetze den Hintergrund durch einen dezenten, gleichmäßigen hellgrauen Studiohintergrund.",
    "Zuschnitt als Portrait (Kopf und Schultern), zentriert, hochkant im Verhältnis 3:4.",
    "Kein Text, keine Rahmen, keine Wasserzeichen.",
  ];
  if (hints.dark) {
    parts.push(
      "Das Original ist stark unterbelichtet: helle die Schatten deutlich auf, rekonstruiere Details in dunklen Bereichen,",
      "korrigiere den Weißabgleich und sorge für eine gleichmäßige, weiche Studiobeleuchtung ohne Farbstich und ohne ausgebrannte Lichter."
    );
  }
  if (hints.blurry) {
    parts.push(
      "Das Original ist unscharf oder verwackelt: rekonstruiere feine Details (Augen, Wimpern, Haaransatz, Kanten der Kleidung) scharf und realistisch,",
      "ohne harte Artefakte, Halos oder einen künstlichen Plastik-Look."
    );
  }
  return parts.join(" ");
}

export const Route = createFileRoute("/api/enhance-photo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        let image: string | undefined;
        let hints: Hints = {};
        try {
          const body = (await request.json()) as { image?: string; hints?: Hints };
          image = body.image;
          hints = body.hints ?? {};
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        if (!image || !image.startsWith("data:image/")) {
          return new Response("Missing image", { status: 400 });
        }

        const prompt = buildPrompt(hints);
        const callModel = (model: string) =>
          fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: image } },
                  ],
                },
              ],
              modalities: ["image", "text"],
            }),
          });

        let upstream = await callModel(MODEL);
        // Difficult originals (very dark or blurry) get a second try on the
        // stronger model when the fast one fails or returns nothing usable.
        const hardPhoto = Boolean(hints.dark || hints.blurry);
        if (!upstream.ok && (upstream.status >= 500 || hardPhoto)) {
          upstream = await callModel(FALLBACK_MODEL);
        }

        if (!upstream.ok) {
          const text = await upstream.text().catch(() => "");
          return new Response(text || "AI request failed", { status: upstream.status });
        }


        const payload = (await upstream.json()) as {
          data?: Array<{ b64_json?: string; url?: string }>;
          choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>;
        };
        const first = payload.data?.[0];
        const result = first?.b64_json
          ? `data:image/png;base64,${first.b64_json}`
          : (first?.url ?? payload.choices?.[0]?.message?.images?.[0]?.image_url?.url);


        if (!result) return new Response("No image returned", { status: 502 });

        // The PDF export rasterises the preview in the browser; a remote image URL
        // would be blocked by CORS and vanish from the PDF. Always inline the photo.
        let inlined = result;
        if (!inlined.startsWith("data:")) {
          const imageResponse = await fetch(inlined);
          if (!imageResponse.ok) {
            return new Response("Enhanced image could not be downloaded", { status: 502 });
          }
          const bytes = new Uint8Array(await imageResponse.arrayBuffer());
          let binary = "";
          for (const byte of bytes) binary += String.fromCharCode(byte);
          const mime = imageResponse.headers.get("content-type") ?? "image/png";
          inlined = `data:${mime};base64,${btoa(binary)}`;
        }

        return new Response(JSON.stringify({ image: inlined }), {
          headers: { "Content-Type": "application/json" },
        });

      },
    },
  },
});
