// Technical-SEO regression tests, run against RENDERED HTML (not source), so the
// same file checks a local `next start`, a Vercel preview, or production:
//   BASE_URL=http://localhost:3000 node --test tests/
// Each assertion encodes a defect measured on production 2026-10-07.
import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const HOST = 'https://offer.xvrbuyshouses.com';
// Vercel previews sit behind deployment protection; pass the bypass secret if set.
const HEADERS = process.env.VERCEL_BYPASS
  ? { 'x-vercel-protection-bypass': process.env.VERCEL_BYPASS }
  : {};

const INDEXABLE = ['/', '/about', '/privacy-policy', '/terms-of-service'];
// Multi-step lead-form steps. /timeline is a form step ("A Couple More Questions":
// timeframe + condition selects, submits to /contact), so it is treated as funnel.
// /contact is the final form step (name/email/phone -> submit -> /thank-you).
const FUNNEL = ['/contact', '/timeline', '/thank-you', '/property-details', '/property-value', '/property-listed'];

const cache = new Map();
async function get(path) {
  if (!cache.has(path)) {
    // redirect: 'manual' on purpose: a protected Vercel preview 302s to
    // vercel.com/login, and following it made the 200 test pass on a login page.
    const res = await fetch(BASE + path, { headers: HEADERS, redirect: 'manual' });
    cache.set(path, { status: res.status, body: await res.text() });
  }
  return cache.get(path);
}
const head = (html) => html.split('</head>')[0];
const title = (html) => (head(html).match(/<title>([^<]*)<\/title>/) || [])[1];
const metaContent = (html, name) =>
  [...head(html).matchAll(new RegExp(`<meta name="${name}" content="([^"]*)"`, 'g'))].map((m) => m[1]);
const canonicals = (html) =>
  [...html.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((m) => m[1]);

test('every page renders 200 (form-flow steps must stay reachable)', async () => {
  for (const p of [...INDEXABLE, ...FUNNEL]) {
    assert.equal((await get(p)).status, 200, p);
  }
});

test('indexable pages have unique titles (all were identical on 2026-10-07)', async () => {
  const titles = {};
  for (const p of INDEXABLE) titles[p] = title((await get(p)).body);
  for (const [p, t] of Object.entries(titles)) assert.ok(t, `${p} has no <title>`);
  assert.equal(new Set(Object.values(titles)).size, INDEXABLE.length, JSON.stringify(titles, null, 2));
});

test('indexable pages have exactly one, unique meta description', async () => {
  const descs = {};
  for (const p of INDEXABLE) {
    const d = metaContent((await get(p)).body, 'description');
    assert.equal(d.length, 1, `${p} description count ${d.length}`);
    descs[p] = d[0];
  }
  assert.equal(new Set(Object.values(descs)).size, INDEXABLE.length, JSON.stringify(descs, null, 2));
});

test('indexable pages carry exactly one self-referencing canonical on the offer host', async () => {
  // Bug seen in prod: two hardcoded canonicals per page, all pointing at the homepage,
  // which tells Google every page is a duplicate of "/".
  for (const p of INDEXABLE) {
    const c = canonicals((await get(p)).body);
    const ok = p === '/' ? [HOST, HOST + '/'] : [HOST + p];
    assert.equal(c.length, 1, `${p} canonicals: ${JSON.stringify(c)}`);
    assert.ok(ok.includes(c[0]), `${p} canonical is ${c[0]}`);
  }
});

test('indexable pages are not noindexed', async () => {
  for (const p of INDEXABLE) {
    for (const r of metaContent((await get(p)).body, 'robots')) {
      assert.ok(!/noindex/i.test(r), `${p} robots=${r}`);
    }
  }
});

test('funnel steps are "noindex, follow" with no canonical', async () => {
  for (const p of FUNNEL) {
    const html = (await get(p)).body;
    const robots = metaContent(html, 'robots');
    assert.ok(robots.some((r) => /noindex/.test(r) && /(^|,\s*)follow/.test(r)), `${p} robots=${JSON.stringify(robots)}`);
    // No canonical at all: canonical + noindex is a mixed signal to Google.
    assert.deepEqual(canonicals(html), [], `${p} has a canonical`);
  }
});

test('sitemap.xml lists exactly the indexable pages', async () => {
  const { status, body } = await get('/sitemap.xml');
  assert.equal(status, 200);
  const locs = [...body.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1].replace(/\/$/, '') || m[1]);
  const want = INDEXABLE.map((p) => (p === '/' ? HOST : HOST + p));
  for (const p of FUNNEL) assert.ok(!locs.includes(HOST + p), `sitemap still lists ${p}`);
  assert.deepEqual([...locs].sort(), [...want].sort());
});

test('Google Tag Manager snippet is intact on every page (Search Console verifies via GTM)', async () => {
  for (const p of [...INDEXABLE, ...FUNNEL]) {
    const html = (await get(p)).body;
    assert.ok(html.includes("'https://www.googletagmanager.com/gtm.js?id='+i+dl"), `${p} gtm.js loader missing`);
    assert.ok(html.includes("})(window,document,'script','dataLayer','GTM-M8B54RB8');"), `${p} GTM container id missing`);
    assert.ok(html.includes('https://www.googletagmanager.com/ns.html?id=GTM-M8B54RB8'), `${p} GTM noscript missing`);
  }
});
