# Vorlagen-Galerie direkt unter den persönlichen Daten im Editor

## Ziel
Im Editor-Schritt „Persönliche Daten" soll die Vorlagen-Auswahl (TemplateGallery) direkt unterhalb der persönlichen Daten erscheinen – der Nutzer sieht Foto, Name, Kontaktfelder und sofort darunter alle Vorlagen mit Farbauswahl, ohne erst zum Design-/Abschluss-Schritt wechseln zu müssen.

## Änderung

**`src/components/resume/ResumeForm.tsx`**
- Im `TabsContent value="personal"` wird nach der persönliche-Daten-Card die bestehende Komponente `<TemplateGallery data={data} onChange={onChange} variant="full" />` eingefügt.
- Damit erscheinen unter den Eingabefeldern: Vorlagen-Galerie (horizontal scrollbar, mit „Empfohlen"/„Neu"-Badges und aktiver Markierung) sowie die Akzentfarb-Auswahl – beides aktualisiert die Live-Vorschau rechts in Echtzeit, weil `onChange` dieselbe Datenquelle speist.
- Keine Duplikat-Logik: die Galerie wird nicht neu gebaut, sondern die vorhandene `TemplateGallery`-Komponente wiederverwendet (gleiche wie im Anpassen-Panel und Abschluss-Schritt).

## Nicht geändert
- Die Galerie im Abschluss-Schritt und im Anpassen-Panel bleibt bestehen (Wechsel dort weiterhin möglich).
- Keine Preis-, Zahlungs- oder Backend-Änderungen.

## Verifikation
- `bunx tsgo --noEmit`
- Kurzer Browser-Check: Editor öffnen, Schritt „Persönliche Daten" zeigt unter den Feldern die Vorlagen; Klick auf eine Vorlage aktualisiert die Live-Vorschau.
