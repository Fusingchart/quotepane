// Pricing tests: node test.js
const assert = require("assert");
global.window = {};
global.document = { currentScript: null };
global.btoa = (s) => Buffer.from(s, "binary").toString("base64");
global.atob = (s) => Buffer.from(s, "base64").toString("binary");
require("./widget.js");
const { computeQuote, encode, decode } = window.QuotePane;

const cfg = {
  biz: "Test Co", min: 150, spread: 0, currency: "$",
  services: [
    { n: "House wash", u: "sqft", r: 0.15 },
    { n: "Driveway", u: "sqft", r: 0.2, m: 100 },
    { n: "Gutters", u: "linft", r: 1.5 },
    { n: "Roof", u: "flat", r: 400 },
  ],
};
const on = (qty) => ({ on: true, qty });

let q = computeQuote(cfg, [on(2000)]);
assert.strictEqual(q.total, 300, "house wash 2000 sqft");

q = computeQuote(cfg, [on(500)]);
assert.strictEqual(q.total, 150, "job minimum applies");
assert.ok(q.minApplied);

q = computeQuote(cfg, [null, on(100)]);
assert.strictEqual(q.lines[0].amount, 100, "per-service minimum");

q = computeQuote(cfg, [on(""), { on: false, qty: 500 }]);
assert.strictEqual(q.lines.length, 0, "empty qty and unchecked are ignored");

q = computeQuote(cfg, [null, null, null, on("")]);
assert.strictEqual(q.lines.length, 0, "free tier caps at 3 services");

const pro = { ...cfg, pro: "KEY", bundle: { n: 2, pct: 10 } };
q = computeQuote(pro, [on(2000), on(1000), null, on("")]);
assert.strictEqual(q.subtotal, 300 + 200 + 400);
assert.strictEqual(q.discount, 90, "10% bundle on 3 services");
assert.strictEqual(q.total, 810);

q = computeQuote({ ...cfg, bundle: { n: 2, pct: 10 } }, [on(2000), on(1000)]);
assert.strictEqual(q.discount, 0, "bundle discount is Pro only");

q = computeQuote({ ...cfg, spread: 10 }, [on(2000)]);
assert.ok(Math.abs(q.low - 270) < 1e-9 && Math.abs(q.high - 330) < 1e-9, "spread range");

q = computeQuote(cfg, [on(-50)]);
assert.strictEqual(q.lines.length, 0, "negative qty ignored");

const round = decode(encode({ biz: "Café Ñandú & Sons", services: [] }));
assert.strictEqual(round.biz, "Café Ñandú & Sons", "utf-8 config round trip");
console.log("all pricing tests passed");
