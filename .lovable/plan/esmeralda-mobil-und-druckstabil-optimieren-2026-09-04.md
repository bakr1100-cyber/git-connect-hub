# Esmeralda mobil- und druckstabil optimieren

## Ziel
Das Esmeralda-CV bleibt intern ein echtes A4-Dokument, wird aber auf kleinen Bildschirmen vollständig und proportional verkleinert dargestellt. Druck und PDF-Export behalten feste A4-Maße und stabile Abstände.

## Umsetzung
1. **A4-Vorschau responsiv skalieren**
   - Einen wiederverwendbaren Vorschau-Rahmen ergänzen, der die verfügbare Breite misst.
   - Das 210 × 297-mm-Dokument auf Mobilgeräten proportional per Transform verkleinern.
   - Die äußere Höhe passend zur Skalierung reservieren, damit kein seitlicher Überlauf und kein unnötiger Leerraum entsteht.
   - Export und Druck rendern weiterhin das unskalierte A4-Dokument.

2. **Esmeralda-Layout stabilisieren**
   - Zweispaltenbereiche mit festen, schrumpfbaren Grid-Spalten statt instabiler 50%-Flexbreiten aufbauen.
   - Lange Namen, Positionen, Links und Kontaktwerte zuverlässig umbrechen.
   - Datumsmarken, Foto, Wasserzeichen und Fußzeile gegen Verschieben und Überlauf absichern.
   - Abschnittsabstände so begrenzen, dass sie bei verändertem Schriftmaß konsistent bleiben.

3. **Druck/PDF absichern**
   - Druckregeln für exakt 210 × 297 mm, ohne Schatten, Browser-Ränder oder Preview-Transform ergänzen.
   - PDF-Capture explizit vom unskalierten Dokument erstellen, damit mobiler Zoom die Exportauflösung nicht beeinflusst.

4. **Prüfung**
   - Esmeralda mit realistischen langen Inhalten bei 390 px Mobilbreite und Desktop prüfen.
   - Herauszoomen im Workspace testen.
   - PDF exportieren und Seitenzahl sowie sichtbare Ränder/Überläufe kontrollieren.
   - Druckdarstellung emulieren und A4-Abmessungen verifizieren.
