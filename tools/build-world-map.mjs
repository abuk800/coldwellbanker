// Erzeugt die Netzwerk-Weltkarte (inline SVG) und schreibt sie in index.html
// zwischen <!-- WELTKARTE:START --> und <!-- WELTKARTE:END -->.
// Daten: Natural Earth (gemeinfrei) über world-atlas.
// Aufruf: npm i world-atlas topojson-client d3-geo && node tools/build-world-map.mjs [index.html]
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { feature, merge } from 'topojson-client';
import { geoNaturalEarth1, geoMercator, geoPath, geoCentroid, geoBounds } from 'd3-geo';

const require = createRequire(import.meta.url);
const load = n => JSON.parse(readFileSync(require.resolve(`world-atlas/${n}.json`)));
const t110 = load('countries-110m');
const t50 = load('countries-50m');

// Coldwell-Banker-Länder laut coldwellbanker.de (19 / 22 / 4 / 5)
const CB = {
  europa: { '008': 'Albanien', '020': 'Andorra', '056': 'Belgien', '276': 'Deutschland', '826': 'England', '250': 'Frankreich', '300': 'Griechenland', '372': 'Irland', '380': 'Italien', '442': 'Luxemburg', '470': 'Malta', '492': 'Monaco', '616': 'Polen', '620': 'Portugal', '756': 'Schweiz', '724': 'Spanien', '196': 'Zypern', 'N. Cyprus': 'Nordzypern', '792': 'Türkei' },
  amerika: { '032': 'Argentinien', '533': 'Aruba', '044': 'Bahamas', '060': 'Bermuda', '092': 'Britische Jungferninseln', '124': 'Kanada', '136': 'Kaimaninseln', '152': 'Chile', '188': 'Costa Rica', '531': 'Curaçao', '214': 'Dominikanische Republik', '308': 'Grenada', '388': 'Jamaika', '484': 'Mexiko', '600': 'Paraguay', '630': 'Puerto Rico', '652': 'Saint Barthélemy', '663': 'Saint Martin', '534': 'Sint Maarten', '840': 'Vereinigte Staaten', '858': 'Uruguay', '850': 'Amerikanische Jungferninseln' },
  asien: { '116': 'Kambodscha', '356': 'Indien', '360': 'Indonesien', '860': 'Usbekistan' },
  nahost: { '818': 'Ägypten', '682': 'Saudi-Arabien', '834': 'Tansania (inkl. Sansibar)', '784': 'Vereinigte Arabische Emirate' },
};
const keyOf = f => f.id || f.properties.name;
const cbInfo = new Map();
for (const [region, list] of Object.entries(CB)) for (const [k, name] of Object.entries(list)) cbInfo.set(k, { region, name });

const fc110 = feature(t110, t110.objects.countries).features.filter(f => f.id !== '010'); // ohne Antarktis
const fc50 = feature(t50, t50.objects.countries).features.filter(f => f.id !== '010');
const r1 = s => s.replace(/(\d+\.\d)\d+/g, '$1');

// ---------- Weltkarte ----------
const W = 1000;
const proj = geoNaturalEarth1().fitWidth(W, { type: 'FeatureCollection', features: fc110 });
const path = geoPath(proj);
const [[, y0], [, y1]] = path.bounds({ type: 'FeatureCollection', features: fc110 });
proj.translate([proj.translate()[0], proj.translate()[1] - y0 + 4]);
const H = Math.ceil(y1 - y0 + 8);

// Karibik-Ausschnitt (für Rahmen und Lupe)
const CARIB = [[-85.5, 9.6], [-55.5, 27.4]];
const inCarib = ([lon, lat]) => lon > CARIB[0][0] && lon < CARIB[1][0] && lat > CARIB[0][1] && lat < CARIB[1][1];

const nonCb = t110.objects.countries.geometries.filter(g => g.id !== '010' && !cbInfo.has(g.id || g.properties.name));
const land = r1(path(merge(t110, nonCb)));

const have110 = new Set(fc110.map(keyOf));
const cbPaths = [], dots = [];
for (const [k, info] of cbInfo) {
  const f110 = fc110.find(f => keyOf(f) === k);
  const f50 = fc50.find(f => keyOf(f) === k);
  const f = f110 || f50;
  if (f110) {
    const d = r1(path(f110));
    cbPaths.push(`<path class="wm-cb" data-region="${info.region}" data-name="${info.name}" d="${d}"/>`);
  } else if (f50) {
    const d = r1(path(f50));
    if (d) cbPaths.push(`<path class="wm-cb" data-region="${info.region}" data-name="${info.name}" d="${d}"/>`);
  }
  // Kleinstaaten zusätzlich als Punkt, außer im Karibik-Ausschnitt (dort zeigt die Lupe sie)
  const area = path.area(f);
  const c = geoCentroid(f);
  if ((area < 20 || !have110.has(k)) && !inCarib(c)) {
    const [x, y] = proj(c);
    dots.push(`<circle class="wm-dot" data-region="${info.region}" data-name="${info.name}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6"/>`);
  }
}
const [fx0, fy0] = proj([CARIB[0][0], CARIB[1][1]]);
const [fx1, fy1] = proj([CARIB[1][0], CARIB[0][1]]);
const frame = `<rect class="wm-frame" x="${fx0.toFixed(1)}" y="${fy0.toFixed(1)}" width="${(fx1 - fx0).toFixed(1)}" height="${(fy1 - fy0).toFixed(1)}"/>`;

const world = `<svg class="wm__world" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="wm-title">
<title id="wm-title">Weltkarte: Länder mit Coldwell Banker Büros</title>
<defs><linearGradient id="wmGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="wm-stop-a"/><stop offset="1" class="wm-stop-b"/></linearGradient></defs>
<path class="wm-land" d="${land}"/>
<g class="wm-cbs">${cbPaths.join('')}</g>
<g class="wm-dots">${dots.join('')}</g>
${frame}
</svg>`;

// ---------- Karibik-Lupe ----------
const IW = 470, IH = 300;
const box = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[CARIB[0][0], CARIB[0][1]], [CARIB[0][0], CARIB[1][1]], [CARIB[1][0], CARIB[1][1]], [CARIB[1][0], CARIB[0][1]], [CARIB[0][0], CARIB[0][1]]]] } }; // Ring im Uhrzeigersinn (d3-Konvention)
const iproj = geoMercator().fitExtent([[0, 0], [IW, IH]], box).clipExtent([[0, 0], [IW, IH]]);
const ipath = geoPath(iproj);
const near = f => { const [[a, b], [c, d]] = geoBounds(f); return c > CARIB[0][0] - 2 && a < CARIB[1][0] + 2 && d > CARIB[0][1] - 2 && b < CARIB[1][1] + 2; };
const caribFeatures = fc50.filter(near);
const iland = [], icb = [], idots = [];
for (const f of caribFeatures) {
  const d = ipath(f); if (!d) continue;
  const info = cbInfo.get(keyOf(f));
  if (info && info.region === 'amerika') {
    icb.push(`<path class="wm-cb" data-region="${info.region}" data-name="${info.name}" d="${r1(d)}"/>`);
    if (ipath.area(f) < 30) { const [x, y] = iproj(geoCentroid(f)); idots.push(`<circle class="wm-dot" data-region="${info.region}" data-name="${info.name}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2"/>`); }
  } else iland.push(r1(d));
}
// Beschriftungen: [Zeilen, Punkt-Länge, Punkt-Breite, Label-Länge, Label-Breite, Ausrichtung, Hinweislinie]
const LABELS = [
  [['Bahamas'], -76.6, 24.6, -75.9, 24.45, 'start', false],
  [['Kaimaninseln'], -81.2, 19.3, -80.7, 19.85, 'start', false],
  [['Jamaika'], -77.3, 18.1, -77.3, 17.25, 'middle', false],
  [['Dominikanische Republik'], -70.4, 19.1, -70.4, 20.35, 'middle', false],
  [['Puerto Rico'], -66.5, 18.2, -65.7, 17.35, 'end', false],
  [['Britische', 'Jungferninseln'], -64.6, 18.45, -62.3, 20.1, 'start', true],
  [['Saint Martin ·', 'Sint Maarten'], -63.06, 18.05, -62.3, 18.75, 'start', true],
  [['Saint Barthélemy'], -62.84, 17.9, -62.3, 17.35, 'start', true],
  [['Amerikanische', 'Jungferninseln'], -64.8, 17.75, -62.3, 16.45, 'start', true],
  [['Aruba'], -69.97, 12.52, -70.5, 12.4, 'end', false],
  [['Curaçao'], -68.95, 12.18, -68.6, 11.35, 'start', false],
  [['Grenada'], -61.68, 12.12, -62.2, 12.0, 'end', false],
];
const labels = LABELS.map(([lines, plon, plat, llon, llat, anchor, leader]) => {
  const [px, py] = iproj([plon, plat]);
  const [x, y] = iproj([llon, llat]);
  const tspans = lines.map((l, i) => `<tspan x="${x.toFixed(1)}"${i ? ' dy="1.1em"' : ''}>${l}</tspan>`).join('');
  const line = leader ? `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${(x - 3).toFixed(1)}" y2="${(y - 3).toFixed(1)}"/>` : '';
  return `${line}<text y="${y.toFixed(1)}" text-anchor="${anchor}">${tspans}</text>`;
}).join('');
const inset = `<figure class="wm__inset">
<svg viewBox="0 0 ${IW} ${IH}" role="img" aria-label="Ausschnitt Karibik mit den Coldwell Banker Standorten">
<path class="wm-land" d="${iland.join('')}"/>
<g class="wm-cbs">${icb.join('')}</g>
<g class="wm-dots">${idots.join('')}</g>
<g class="wm-labels">${labels}</g>
</svg>
<figcaption>Karibik</figcaption>
</figure>`;

// ---------- In index.html schreiben ----------
const file = process.argv[2] || 'index.html';
const html = readFileSync(file, 'utf8');
const re = /(<!-- WELTKARTE:START -->)[\s\S]*?(<!-- WELTKARTE:END -->)/;
if (!re.test(html)) throw new Error('Marker WELTKARTE:START/END nicht gefunden');
const out = `<div class="wm__map"><div class="wm__scroll">${world}</div>${inset}</div>`;
writeFileSync(file, html.replace(re, `$1\n${out}\n$2`));
console.log(`Weltkarte geschrieben: ${cbPaths.length} Länderflächen, ${dots.length} Punkte, Lupe ${icb.length} Flächen, ${(out.length / 1024).toFixed(0)} KB`);
