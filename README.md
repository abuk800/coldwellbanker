# Coldwell Banker Deutschland – Startseiten-Entwurf

Klickbarer, voll responsiver Entwurf der neuen Startseite für **coldwellbanker.de** (Zweittermin mit dem Kunden, Relaunch Q1).
Statisches HTML/CSS/JS, ohne Build-Schritt und ohne externe Abhängigkeiten.

## Ansehen

```bash
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen. Mit `http://localhost:8000/?hinweise` startet die Seite direkt im Präsentationsmodus.

## Präsentationsmodus

Unten rechts sitzt eine Leiste (nur für den Termin, im Relaunch entfernen):

- **Entwurfshinweise**: blendet nummerierte Hinweise ein, die jede Gestaltungsentscheidung und jeden Platzhalter erklären.
- **Bewertungen: Start (0) / Aufbau (3) / Etabliert (24)**: zeigt, wie das Vertrauensmodul mit wachsender Zahl an Bewertungen mitwächst.

## Leitidee: „Global gedacht. In Deutschland zu Hause.“

Die Reihenfolge der Seite bildet die Formel ab: zuerst Nähe und Vertrauen, dann das internationale Netzwerk als Mehrwert.

1. Hero mit Suchmodul (Kaufen / Mieten / Verkaufen); „Verkaufen“ führt direkt zur kostenfreien Wertermittlung
2. Vertrauensleiste mit konkreten Serviceversprechen, die auch ohne Bewertungen tragen
3. Selbstverständnis: regionale Kompetenz → verlässlicher Prozess → internationale Reichweite
4. Kennzahlen (nur belegte Zahlen aus dem Briefing)
5. Sechs Leistungskarten
6. Objektkarten mit Lage, Fläche, Zimmern, Preis und Badge, filterbar
7. Verkaufsprozess in fünf nachvollziehbaren Schritten
8. Standorte: Deutschlandkarte und alle fünf Standorte (heute zeigt die Seite nur zwei)
9. Globales Netzwerk / Global Luxury, bewusst erst an dieser Stelle
10. Gründer Florian Freytag-Gross
11. Mitwachsendes Bewertungsmodul
12. Partner werden (Franchise-Expansion bis 2030)
13. Kontakt mit drei Wegen: Telefon, E-Mail, persönlicher Termin (Formular klickbar, ohne Versand)

## Vorläufiges Design-System

Bis das CI-Brandbook vorliegt, sind alle Farben, Schriften und Abstände als Tokens in `assets/css/styles.css` (`:root`) definiert und lassen sich zentral austauschen.

- Farben: Markenblau `#012169` (angelehnt an das internationale Coldwell-Banker-Blau) mit warmen Neutraltönen statt reinem Weiß
- Schriften: Cormorant Garamond (Headlines) und Manrope (Fließtext), **lokal eingebunden** (kein Google-Fonts-CDN, DSGVO)
- Wortmarke: Platzhalter, wird durch das Original-Logo ersetzt

## Offene Punkte / Platzhalter (vom Kunden)

- [ ] CI-Brandbook: Logo, Farben, Schriften
- [ ] Name, Adresse und Ansprechpartner der Standorte 3–5
- [ ] Telefonnummer (`+49 40 000 000 0` ist Platzhalter) und E-Mail-Adresse bestätigen
- [ ] Porträt Florian Freytag-Gross (Fotoshooting) sowie Freigabe des Zitats (Textvorschlag)
- [ ] Eigene Fotografie aus Hamburg und dem Münchener Süden statt Stockfotos
- [ ] Echte Objekte über die Maklersoftware anbinden (die sechs Objekte sind fiktiv)
- [ ] Bewertungsquelle festlegen (Google und/oder ProvenExpert); die Beispielbewertungen sind als „Beispiel“ markiert und nur zur Demonstration da
- [ ] Serviceversprechen (24-h-Antwort, fester Ansprechpartner usw.) intern bestätigen
- [ ] Franchise- und Markenhinweis im Footer rechtlich prüfen; Impressum und Datenschutz ergänzen
- [ ] Zeitangaben im Verkaufsprozess mit dem Team abstimmen

## Dateien

```
index.html               Startseite
assets/css/styles.css    Design-Tokens und Layout
assets/js/main.js        Suche, Filter, Formular, Bewertungsmodul, Präsentationsmodus
assets/fonts/            Webfonts (SIL Open Font License)
assets/img/              Bildmaterial (Platzhalter)
tools/build-map.mjs      Erzeugt den SVG-Pfad der Deutschlandkarte
```

## Bildnachweise

- Fotos: [Unsplash](https://unsplash.com) (Unsplash-Lizenz), nur Platzhalter für den Entwurf
- Deutschlandkarte: Natural Earth 1:50m (gemeinfrei) über das npm-Paket `world-atlas`
- Schriften: Cormorant Garamond und Manrope (SIL Open Font License), über `@fontsource`
