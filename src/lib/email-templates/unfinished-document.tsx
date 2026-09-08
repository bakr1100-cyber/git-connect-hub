import React from "react";
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  editorUrl?: string;
}

const Email = ({ name, editorUrl }: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Dein Lebenslauf wartet auf dich — nur noch wenige Schritte</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Dein Lebenslauf ist fast fertig</Heading>
        <Text style={text}>{name ? `Hallo ${name},` : "Hallo,"}</Text>
        <Text style={text}>
          du hast bereits mit deinem Lebenslauf begonnen — super! Es fehlen nur noch
          wenige Angaben, bis du ihn als fertiges PDF exportieren kannst.
        </Text>
        <Button style={button} href={editorUrl ?? "https://connect-the-dots-gh.lovable.app/editor"}>
          Lebenslauf fertigstellen
        </Button>
        <Hr style={hr} />
        <Text style={footer}>myCVonline — dein Bewerbungsassistent</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: "Dein Lebenslauf wartet auf dich",
  displayName: "Erinnerung: unfertiges Dokument",
  previewData: { name: "Jane" },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "24px 28px", maxWidth: "560px" };
const heading = { color: "#0f172a", fontSize: "24px" };
const text = { color: "#334155", fontSize: "15px", lineHeight: "24px" };
const button = {
  backgroundColor: "#0d9488",
  color: "#ffffff",
  borderRadius: "8px",
  padding: "12px 20px",
  fontSize: "15px",
  textDecoration: "none",
  display: "inline-block",
  marginTop: "8px",
};
const hr = { borderColor: "#e2e8f0", margin: "24px 0" };
const footer = { color: "#94a3b8", fontSize: "12px" };
