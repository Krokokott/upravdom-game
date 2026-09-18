// Баланс режима «Какой ты житель»: при случайных ответах каждый типаж должен выпадать в 8–17% партий.
// Запуск: node tools/sim-resident.js
const fs = require('fs'), path = require('path');
const src = f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8');
const [RES_CARDS, RES_TYPES, RES_KEYS, resType] = new Function(src('resident.js') + ';return [RES_CARDS,RES_TYPES,RES_KEYS,resType]')();
const CARDS = new Function(src('cards.js') + src('cards2.js') + ';return CARDS')();

// Проверки колоды
const ids = [...RES_CARDS, ...CARDS].map(c => c.id), dup = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dup.length) throw new Error('Повторяются id: ' + dup.join(', '));
for (const c of RES_CARDS) for (const s of ['L', 'R']) {
  const k = Object.keys(c[s].pts);
  if (!k.length || k.length > 2 || k.some(x => !RES_TYPES[x])) throw new Error('Неверные pts в ' + c.id);
}
for (const k of RES_KEYS) for (const r of ['good', 'bad']) if (!RES_TYPES[RES_TYPES[k][r]] || RES_TYPES[k][r] === k) throw new Error(`${k}.${r}`);
const total = Object.fromEntries(RES_KEYS.map(k => [k, 0])), mentions = { ...total };
for (const c of RES_CARDS) for (const s of ['L', 'R']) for (const k in c[s].pts) { total[k] += c[s].pts[k]; mentions[k]++; }
console.log(`Карточек: ${RES_CARDS.length}`);
console.log('Очков в колоде:', RES_KEYS.map(k => `${k} ${total[k]} (${mentions[k]})`).join(', '));

// Симуляция
const TURNS = 20, N = 20000, wins = Object.fromEntries(RES_KEYS.map(k => [k, 0]));
for (let n = 0; n < N; n++) {
  const pool = RES_CARDS.slice(), pts = Object.fromEntries(RES_KEYS.map(k => [k, 0])), hist = [];
  for (let t = 0; t < TURNS; t++) {
    const c = pool.splice(Math.floor(Math.random() * pool.length), 1)[0], ch = Math.random() < .5 ? c.L : c.R;
    for (const k in ch.pts) pts[k] += ch.pts[k];
    hist.push(ch.pts);
  }
  wins[resType(pts, hist)]++;
}
let ok = true;
console.log('Типаж при случайных ответах:');
for (const k of RES_KEYS) {
  const p = wins[k] / N * 100, good = p >= 8 && p <= 17; ok = ok && good;
  console.log(`  ${RES_TYPES[k].name.padEnd(20)} ${p.toFixed(1)}%${good ? '' : '  <-- вне 8–17%'}`);
}
console.log(ok ? 'Баланс в норме' : 'Баланс нарушен');
process.exitCode = ok ? 0 : 1;
