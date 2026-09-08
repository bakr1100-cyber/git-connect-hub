# Lokale Entwicklung – Backend & Datenbank

Das komplette Backend liegt als Code im Projekt: alle Tabellen, Regeln und
Funktionen stehen in `supabase/migrations/`. Damit lässt sich die Datenbank
jederzeit lokal von Grund auf neu aufbauen.

## Was in der Datenbank steckt

| Tabelle | Inhalt |
| --- | --- |
| `applicant_profiles` | Stammdaten des Nutzers (Name, Kontakt, Zielposition …) |
| `resumes` | Lebenslauf-Inhalte, Anschreiben, Einstellungen |
| `user_templates` | Eigene hochgeladene Vorlagen |
| `packages` | Paketkatalog: Einzel-Export, Premium, Unlimited 6/12 Monate |
| `purchases` | Belege: Rechnungsnummer, Betrag, Status, Gültigkeit |
| `user_entitlements` | Aktuell freigeschaltetes Paket inkl. Ablaufdatum |
| `ai_usage` | Tägliche KI-Nutzung pro Nutzer |

Funktionen: `ai_quota_for_tier(tier)` liefert das Tageslimit je Paket,
`consume_ai_quota(cost)` prüft und verbraucht das Kontingent atomar.
Nutzerkonten selbst verwaltet die Auth-Schicht (`auth.users`).

## Lokal starten

Voraussetzungen: Docker und die Supabase CLI.

```bash
# 1. Backend lokal hochfahren (Datenbank, Auth, Storage, Studio)
supabase start

# 2. Alle Migrationen + Demodaten einspielen
supabase db reset

# 3. Frontend starten
bun install
bun run dev
```

`supabase start` gibt die lokale API-URL und den anon-Key aus. Diese Werte in
eine lokale `.env` eintragen (Vorlage: `.env.example`).

Demo-Login nach `supabase db reset`: `demo@mycvonline.local` / `demo1234`
(mit aktivem Premium-Paket, einem Beleg und KI-Nutzung).

## Schema ändern

Neue Änderungen immer als neue Datei in `supabase/migrations/` anlegen:

```bash
supabase migration new mein_aenderung
# SQL schreiben, dann:
supabase db reset
```

Bestehende Migrationsdateien nie nachträglich bearbeiten – sonst weichen
lokale und Online-Datenbank voneinander ab.
