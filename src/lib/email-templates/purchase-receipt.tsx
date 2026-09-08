import React from "react";
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  orderId?: string;
  packageName?: string;
  price?: string;
  days?: number;
  validUntil?: string;
  date?: string;
}

const Email = ({ name, orderId, packageName, price, days, validUntil, date }: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Deine Bestellbestätigung von myCVonline</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Bestellbestätigung</Heading>
        <Text style={text}>{name ? `Hallo ${name},` : "Hallo,"}</Text>
        <Text style={text}>
          vielen Dank für deinen Kauf. Dein Paket ist ab sofort freigeschaltet — Lebenslauf-Editor,
          KI-Bewerbungsfoto und PDF-Download stehen dir zur Verfügung.
        </Text>

        <Section style={box}>
          <Text style={row}>
            <strong>Rechnungsnummer:</strong> {orderId ?? "—"}
          </Text>
          <Text style={row}>
            <strong>Datum:</strong> {date ?? "—"}
          </Text>
          <Text style={row}>
            <strong>Paket:</strong> {packageName ?? "—"}
            {days ? ` (${days} Tage Zugriff)` : ""}
          </Text>
          <Text style={row}>
            <strong>Gültig bis:</strong> {validUntil ?? "—"}
          </Text>
          <Text style={total}>
            <strong>Gesamt: {price ?? "—"}</strong>
          </Text>
        </Section>

        <Text style={text}>
          Diese Bestätigung findest du jederzeit in deinem Konto unter „Bewerbungspaket“ wieder.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>myCVonline — dein Bewerbungsassistent</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: "Deine Bestellbestätigung — myCVonline",
  displayName: "Bestellbestätigung",
  previewData: {
    name: "Jane",
    orderId: "INV-2026-ABC123",
    packageName: "Premium",
    price: "19,90 €",
    days: 30,
    validUntil: "04.10.2026",
    date: "04.09.2026",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "24px 28px", maxWidth: "560px" };
const heading = { color: "#0f172a", fontSize: "24px" };
const text = { color: "#334155", fontSize: "15px", lineHeight: "24px" };
const box = {
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px 18px",
  margin: "16px 0",
};
const row = { color: "#334155", fontSize: "14px", lineHeight: "22px", margin: "0 0 4px" };
const total = { color: "#0f172a", fontSize: "16px", margin: "12px 0 0" };
const hr = { borderColor: "#e2e8f0", margin: "24px 0" };
const footer = { color: "#94a3b8", fontSize: "12px" };
