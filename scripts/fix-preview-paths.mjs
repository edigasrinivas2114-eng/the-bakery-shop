// Preview export only: CSS files live in _next/static/css/, so font URLs must point to ../media/.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
const dir = 'out/_next/static/css';
for (const f of readdirSync(dir)) {
  const p = `${dir}/${f}`;
  writeFileSync(p, readFileSync(p, 'utf8').replace(/url\((?:\.\/)?_next\/static\/media\//g, 'url(../media/'));
}
console.log('preview css paths fixed');
