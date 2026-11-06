// Erzeugt den SVG-Pfad der Deutschlandkarte (Natural Earth 1:50m, Public Domain)
// Aufruf: npm i world-atlas topojson-client && node tools/build-map.mjs
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/countries-50m.json')));
const de = feature(topo, topo.objects.countries).features.find(f => f.id === '276');
const W = 400, lat0 = 51.2 * Math.PI / 180;
const box = { minX: 5.8, maxX: 15.1, minY: 47.2, maxY: 55.1 };
const sx = W / ((box.maxX - box.minX) * Math.cos(lat0));
const H = Math.round((box.maxY - box.minY) * sx);
const proj = ([lon, lat]) => [((lon - box.minX) * Math.cos(lat0) * sx).toFixed(1), ((box.maxY - lat) * sx).toFixed(1)];
const polys = de.geometry.type === 'Polygon' ? [de.geometry.coordinates] : de.geometry.coordinates;
const d = polys.map(p => p.map(r => 'M' + r.map(proj).map(c => c.join(',')).join('L') + 'Z').join('')).join('');
const pts = { Hamburg: [9.993, 53.551], 'Muenchen-Sued': [11.52, 47.98] };
console.log(JSON.stringify({ viewBox: `0 0 ${W} ${H}`, d, pts: Object.fromEntries(Object.entries(pts).map(([k, v]) => [k, proj(v)])) }));
