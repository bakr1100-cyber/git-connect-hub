# Plan: KI-Lebenslauf- & Anschreiben-Generator

## Ziel
Eine mobile-first Web-App im Stil von OnlineLebenslauf.com, mit der Nutzerinnen und Nutzer aus dem MENA-Raum (insbesondere Marokko) und Europa einen professionellen, ATS-freundlichen Lebenslauf und ein passendes Anschreiben erstellen können.

## Produktentscheidungen
- **Umfang:** Kompletter MVP-Flow, aber in drei aufeinander aufbauenden Phasen.
- **Sprache der UI:** Deutsch (primärer Markt Deutschland/Europa), Inhalte auf Deutsch oder Englisch wählbar.
- **Bezahlmodell:** Einmalzahlungen, kein Abo.
- **Zielgruppe:** Internationale Bewerber, insbesondere mit Darija/Arabisch/Französisch als Eingabesprache.

## Technische Grundlage
- **Framework:** TanStack Start (bereits im Projekt).
- **Backend & Datenbank:** Lovable Cloud (Supabase) für Profile, Sessions, Zahlungsstatus und Dokumente.
- **KI:** Lovable AI Gateway für Übersetzung, Optimierung und Anschreiben-Generierung.
- **Zahlung:** PayPal Business SDK für Karten/PayPal; Cash Plus Maroc API für lokale Bargeld-/Wallet-Zahlungen.
- **PDF-Export:** Serverseitige Generierung über Puppeteer/Playwright oder clientseitig mit html2pdf.js, je nach Hosting-Einschränkungen.
- **Voice Input:** Browser-Mikrofon + OpenAI Whisper über Lovable AI Gateway.

## Phasenplan

### Phase 1: Landing Page & Lebenslauf-Editor (ohne Bezahlung)
**Ziel:** Nutzer kann Daten eingeben, Live-Vorschau sehen und PDF herunterladen.

1. **Landing Page**
   - Hero mit Value Proposition ("ATS-geprüfte Lebenslauf-Vorlagen", "Kein Abo", "Einmalzahlung").
   - Social Proof (Testimonials, Zahlen).
   - CTA "Lebenslauf erstellen".
   - Footer mit AGB, Datenschutz, Impressum.

2. **Multi-Step-Formular**
   - Schritt 1: Persönliche Daten (Name, Geburtsdatum, E-Mail, Telefon, Ort, Foto-Upload).
   - Schritt 2: Ausbildung (dynamische Liste, Datum, Institution, Abschluss).
   - Schritt 3: Berufserfahrung (dynamische Liste, Datum, Arbeitgeber, Rolle, Beschreibung).
   - Schritt 4: Fähigkeiten & Sprachen.
   - Schritt 5: Ausgabe-Einstellungen (Sprache: Deutsch/Englisch, Vorlage wählen).

3. **Live-Vorschau**
   - Interaktiver Lebenslauf-Canvas neben dem Formular (Desktop) / unter dem Formular (Mobile).
   - Mindestens drei Vorlagen: Minimalist, Modern, Europäisch.
   - RTL-Erkennung für Arabisch/Darija in Eingabefeldern.

4. **PDF-Download (noch kostenlos in Phase 1)**
   - Clientseitiger PDF-Export mit html2pdf.js oder serverseitig mit Puppeteer.
   - Pixel-perfect Rendering auf Mobile und Desktop testen.

5. **Datenpersistenz**
   - Supabase-Tabelle `profiles` oder `resumes` für Formular-Daten.
   - Anonymer Draft-Speicher per localStorage, optional mit Account-Verknüpfung.

### Phase 2: KI-Optimierung & Anschreiben
**Ziel:** Rohe Eingaben (Darija, Arabisch, Französisch) werden in professionelles Business-Deutsch/Englisch transformiert.

1. **KI-Optimierungs-Button**
   - In Ausbildungs- und Berufserfahrung-Feldern: Button "Mit KI optimieren".
   - Server-Funktion sendet Text an Lovable AI Gateway.
   - System-Prompt gemäß Master-Prompt: Faktentreue, keine Halluzinationen, Nominalform, unternehmerischer Fokus.

2. **Voice-to-Text**
   - Mikrofon-Button pro Textfeld.
   - Audio-Aufnahme im Browser, Upload an Server, Transkription via Whisper.
   - Ergebnis wird ins Eingabefeld übernommen.

3. **Anschreiben-Generator (Premium-Feature)**
   - Automatische Generierung basierend auf Profil + Zielsprache.
   - Editierbarer Rich-Text-Bereich.
   - PDF-Export für Lebenslauf + Anschreiben.

4. **Zahlungs-UI vorbereiten**
   - Preis-Tiers anzeigen: Standard (€9,99), Premium (€15,00), Premium Plus (€60,00).
   - UI für "Kein Abo", "Sichere Bezahlung", Trust-Badges.

### Phase 3: Bezahlung & Freischaltung
**Ziel:** Dokumente werden erst nach Zahlung freigeschaltet.

1. **PayPal Integration**
   - PayPal Business SDK für €9,99 / €15,00 / €60,00.
   - Webhook-Endpoint unter `/api/public/paypal-webhook`.
   - Status in Supabase auf `paid` setzen.

2. **Cash Plus Maroc Integration**
   - API-Anbindung für 8-stelligen Zahlungscode (sofern API verfügbar/umsetzbar).
   - Webhook-Endpoint unter `/api/public/cashplus-webhook`.
   - Fallback: Manuelle Verifizierung durch Admin, falls API nicht verfügbar.

3. **Paywall-Logik**
   - PDF-Download erst nach `paid`-Status.
   - Preview weiterhin kostenlos sichtbar.
   - Checkout-Screen vor dem Download.

4. **Premium Plus Buchung**
   - Cal.com-Integration oder einfaches Kontaktformular für 45-Minuten-Session.

## Design-Richtung
- Mobile-first, TikTok-Traffic-optimiert.
- Aufgeräumt, vertrauenswürdig, professionell.
- Farben: Weiß/Hellgrau-Hintergrund, dunkle Schrift, ein Akzentfarbe (z. B. Blau oder Grün) für CTAs.
- Keine Abo-Ästhetik: klare Preise, keine versteckten Kosten.

## Offene Risiken & Entscheidungen
- **Cash Plus Maroc API:** Muss auf Verfügbarkeit und Dokumentation geprüft werden. Fallback ist manuelle Verifizierung.
- **PDF-Engine:** html2pdf.js (einfacher, clientseitig) vs. Puppeteer/Playwright (bessere Qualität, serverseitig). Entscheidung in Phase 1 nach erstem Test.
- **Lovable Cloud:** Muss vor Backend-Implementierung aktiviert werden.

## Nächster Schritt
Phase 1 starten: Landing Page + Multi-Step-Editor + Live-Vorschau + PDF-Download ohne Bezahlung.
