# Coldwell Banker Deutschland – Startseiten-Entwurf

Klickbarer, voll responsiver Entwurf der neuen Startseite für **coldwellbanker.de**.
Statisches HTML/CSS/JS ohne Build-Schritt. Live-Vorschau (Vercel, automatisch bei jedem Push): https://coldwellbanker-rosy.vercel.app

## Ansehen

```bash
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen. Mit `?hinweise` startet die Seite im Präsentationsmodus. Unten rechts lassen sich die nummerierten Entwurfshinweise ein- und ausblenden.

## Grundsätze dieser Version

- **Inhalt:** ausschließlich Texte, Bilder, Objekte und Kontaktdaten der bestehenden coldwellbanker.de (Startseite sowie die Standortseiten Hamburg und Münchner Süden). Keine erfundenen Inhalte.
- **Struktur:** Reihenfolge der Sections nach der Startseite von von-poll.com/de. Sections ohne passenden Coldwell-Banker-Inhalt (Kundenstimmen, Suchprofil-Push, Newsletter) entfallen.
- **Überschriften:** genau eine H1 (Hero) und je Section genau eine H2; Unterpunkte als H3. Keine Mini-Überschriften über den Headlines.
- **Look:** Cormorant Garamond und Manrope (lokal eingebunden, kein Google-Fonts-CDN), Markenblau `#012169`, warme Neutraltöne. Alle Tokens in `assets/css/styles.css` (`:root`).

## Section-Reihenfolge

| # | von-Poll-Slot | H2 | Quelle |
|---|---|---|---|
| 1 | Hero mit Suche | H1 „Eine globale Marke. Eine neue Perspektive für Deutschland.“ | Startseite |
| 2 | Aktuelle Immobilienangebote | Ausgewählte Immobilien in besonderen Lagen. | Startseite, Standortseite Hamburg |
| 3 | Länder-Teaser | Das weltweite Zuhause exklusiver Immobilien. | Startseite; Weltkarte als Vektorgrafik nachgebaut |
| 4 | Unsere Stärken | Eine der renommiertesten Marken der internationalen Immobilienbranche | Startseite |
| 5 | Premiumleistungen | Persönlich. International. Exklusiv. | Standortseiten |
| 6 | Magazin-Teaser | Live Well with Coldwell | Startseite (Video per Zwei-Klick) |
| 7 | Blog | Marktwissen & Inspiration | Startseite |
| 8 | Wer wir sind | Global gedacht. In Deutschland zu Hause. | Startseite |
| 9 | Standorte | Unsere Standorte | Standortseiten |
| 10 | Geschäftsleitung | Erfahrung, die den Markt prägt. | Startseite |
| 11 | Kennzahlen | Immobilienvermarktung weltweit | Startseite (Hero-Zahlen) |
| 12 | Newsletter-Slot | Ein neuer Akteur im Premium-Immobilienmarkt | Startseite |
| 13 | SEO-Textblock | Exklusive Wohnlagen | Standortseiten |
| 14 | Kontakt | Beratung vereinbaren | Startseite, Standortseiten |

## Offene Punkte

- [ ] Kennzahlen prüfen: Die Seite nennt „3.000+ Immobilien“, an anderer Stelle „3.000 Büros/Standorte“. „98 % Zufriedenheit“ sollte belegbar sein.
- [ ] Vorschaubild des Kampagnenvideos ist sehr amerikanisch geprägt; ggf. eigenes Motiv.
- [ ] Blog-Bilder sind Platzhalter (auch auf der bestehenden Seite).
- [ ] CI-Brandbook: Farben und Schriften final abstimmen; das Logo ist das Original von coldwellbanker.de (für den hellen Header blau eingefärbt).
- [ ] Objekte im Relaunch an Propstack anbinden.

## Dateien

```
index.html               Startseite
assets/css/styles.css    Design-Tokens und Layout
assets/js/main.js        Suche, Slider, Kontakt-Reiter, Video, Formulare, Präsentationsmodus
assets/fonts/            Webfonts (SIL Open Font License)
assets/img/              Bilder und Logos von coldwellbanker.de, Blog-Platzhalter (Unsplash)
tools/build-map.mjs      Erzeugt den SVG-Pfad der Deutschlandkarte (Natural Earth, gemeinfrei)
tools/build-world-map.mjs  Erzeugt die Netzwerk-Weltkarte samt Karibik-Lupe und schreibt sie
                         zwischen <!-- WELTKARTE:START/END --> in index.html
                         (npm i world-atlas topojson-client d3-geo && node tools/build-world-map.mjs)
```
