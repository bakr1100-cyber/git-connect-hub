import { render } from "@react-email/render";
import { createElement } from "react";
import { EmailAPIError, sendLovableEmail } from "@lovable.dev/email-js";
import { TEMPLATES, type TemplateName } from "./registry";

/**
 * Sender configuration.
 *
 * TODO(email-domain): Sobald die Absender-Domain eingerichtet ist
 * (Projekt-Einstellungen → Domain / Cloud → Emails), hier die verifizierte
 * Subdomain eintragen, z. B. SENDER_DOMAIN = "notify.mycvonline.com".
 * Solange SENDER_DOMAIN leer ist, werden alle Sends weich übersprungen
 * ({ sent: false, reason: "emails_not_configured" }) — nichts wird versendet.
 */
export const SITE_NAME = "myCVonline";
export const SENDER_DOMAIN = "";
export const FROM_DOMAIN = SENDER_DOMAIN;

export type SendResult =
  | { sent: true }
  | { sent: false; reason: "emails_not_configured" | "recipient_suppressed" | "rate_limited" };

export async function sendTemplateEmail(
  templateName: TemplateName,
  to: string,
  options: { templateData?: Record<string, unknown>; idempotencyKey: string },
): Promise<SendResult> {
  if (!SENDER_DOMAIN) {
    console.info(`[email] skipped "${templateName}" for recipient — no sender domain configured yet`);
    return { sent: false, reason: "emails_not_configured" };
  }

  const entry = TEMPLATES[templateName];
  if (!entry) throw new Error(`Unknown email template: ${templateName}`);

  const element = createElement(entry.component, options.templateData ?? {});
  const html = await render(element);
  const text = await render(element, { plainText: true });

  try {
    await sendLovableEmail(
      {
        to,
        from: `"${SITE_NAME}" <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject: entry.subject,
        html,
        text,
        purpose: "transactional",
        label: templateName,
        idempotency_key: options.idempotencyKey,
      },
      { apiKey: process.env["LOVABLE_API_KEY"]! },
    );
    return { sent: true };
  } catch (error) {
    if (error instanceof EmailAPIError) {
      if (error.code === "recipient_suppressed") return { sent: false, reason: "recipient_suppressed" };
      if (error.code === "domain_not_verified" || error.code === "emails_disabled") {
        console.warn(`[email] "${templateName}" skipped: ${error.code}`);
        return { sent: false, reason: "emails_not_configured" };
      }
      if (error.status === 429) {
        console.warn(`[email] rate limited, retry after ${error.retryAfterSeconds ?? 60}s`);
        return { sent: false, reason: "rate_limited" };
      }
    }
    throw error;
  }
}
