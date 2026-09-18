const fs = require('fs');
const s = fs.readFileSync('C:/Users/Krokokot/Documents/upravdom-game/index.html', 'utf8');
const js = s.slice(s.indexOf('const C=('), s.lastIndexOf('</script>'));
const [CARDS, OPENING] = eval(js.replace(/\(\(\)=>\{[\s\S]*$/, '') + ';[CARDS,OPENING]');
const BY = Object.fromEntries(CARDS.map(c => [c.id, c]));
const season = i => i <= 3 ? 'winter' : i <= 5 ? 'spring' : i <= 8 ? 'summer' : 'autumn';
const K = ['m', 'p', 's', 'b'];

function run(TURNS, SCALE, START, smart) {
  const v = { m: START, p: START, s: START, b: START }, used = new Set(), q = [];
  const month = t => Math.min(11, Math.floor(t * 12 / TURNS));
  for (let t = 0; t < TURNS; t++) {
    let c;
    if (t < OPENING.length) c = BY[OPENING[t]];
    else {
      const qi = q.findIndex(x => x.at <= t);
      if (qi >= 0) c = BY[q.splice(qi, 1)[0].id];
      else {
        const se = season(month(t));
        const pool = CARDS.filter(c => !c.fixed && !c.follow && (!c.season || c.season.includes(se)) && !used.has(c.id));
        const w = pool.map(c => c.season ? 3 : 1), tot = w.reduce((a, b) => a + b, 0);
        let r = Math.random() * tot; c = pool[pool.length - 1];
        for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r < 0) { c = pool[i]; break; } }
      }
    }
    const after = ch => K.map(k => Math.max(0, Math.min(100, v[k] + Math.round((ch.fx[k] || 0) * SCALE))));
    let ch;
    if (smart) {
      const cost = ch => Math.max(...after(ch).map(x => Math.abs(x - 50)));
      const a = cost(c.L), b = cost(c.R);
      ch = a === b ? (Math.random() < .5 ? c.L : c.R) : (a < b ? c.L : c.R);
      if (Math.random() < 0.15) ch = ch === c.L ? c.R : c.L; // human error
    } else ch = Math.random() < .5 ? c.L : c.R;
    after(ch).forEach((x, i) => v[K[i]] = x);
    if (ch.next) q.push({ id: ch.next, at: t + 2 });
    used.add(c.id);
    if (K.some(k => v[k] <= 0 || v[k] >= 100)) return t + 1;
  }
  return 'win';
}

const N = 10000;
for (const TURNS of [16, 20, 24]) for (const SCALE of [1, 1.25, 1.5, 1.75, 2]) {
  const res = [false, true].map(smart => {
    let w = 0, sum = 0;
    for (let i = 0; i < N; i++) { const r = run(TURNS, SCALE, 50, smart); if (r === 'win') w++; else sum += r; }
    return `${(w / N * 100).toFixed(0)}% (loss@${(sum / Math.max(1, N - w)).toFixed(1)})`;
  });
  console.log(`turns ${TURNS} scale ${SCALE}: random ${res[0]} | careful ${res[1]}`);
}
