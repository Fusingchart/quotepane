// Build a personalised quote link + email for each prospect.
// Usage: node marketing/outreach.js marketing/prospects.json > marketing/outreach.json
const fs = require("fs");
const path = require("path");

global.window = {};
global.document = { currentScript: null };
global.btoa = (s) => Buffer.from(s, "binary").toString("base64");
global.atob = (s) => Buffer.from(s, "base64").toString("binary");
require(path.join(__dirname, "..", "widget.js"));
require(path.join(__dirname, "..", "templates.js"));

const SITE = "https://fusingchart.github.io/quotepane/";
const TEMPLATE = { holiday_lights: "Holiday lights", pressure_washing: "Pressure washing" };
const PITCH = {
  holiday_lights: "price their roofline, trees and bushes themselves before the November rush",
  pressure_washing: "price a house wash or driveway themselves",
};

const prospects = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const out = prospects.map((p) => {
  const tpl = window.QP_TEMPLATES.find((t) => t.name === TEMPLATE[p.trade]);
  const cfg = JSON.parse(JSON.stringify(tpl.config));
  cfg.v = 1;
  cfg.biz = p.name;
  cfg.area = "Serving " + p.city_state;
  cfg.email = p.email;
  cfg.services = cfg.services.slice(0, 3);
  // Short, clean URL: a per-business page under q/<slug>/ that mounts the widget.
  const slug = p.name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const dir = path.join(__dirname, "..", "q", slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<title>Instant quote: ${p.name.replace(/</g, "")}</title><meta name="robots" content="noindex">` +
    `<style>body{margin:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}main{padding:28px 16px 48px}</style></head>` +
    `<body><main><script src="../../widget.js" data-config="${window.QuotePane.encode(cfg)}"></script></main></body></html>\n`);
  const link = SITE + "q/" + slug + "/";
  const subject = `Made you a free instant-quote link for ${p.name}`;
  const body = [
    "Hi,",
    "",
    `I came across ${p.name} while looking at ${p.trade === "holiday_lights" ? "holiday lighting" : "exterior cleaning"} companies in ${p.city_state}, and noticed ${p.detail}. Your site asks people to reach out for a quote, so I set up a free page where homeowners can ${PITCH[p.trade]} and send you the request with their address:`,
    "",
    link,
    "",
    `The rates on it are placeholders. You can set your own in about 2 minutes here: ${SITE}builder.html. You can then put it on your website, Google Business Profile or Facebook page. Free for up to 3 services. If it wins you jobs, Pro is a one-time $29.`,
    "",
    "Hope it's useful either way.",
    "",
    "The QuotePane team",
    SITE,
    process.env.QP_POSTAL || "[postal address required by CAN-SPAM]",
    "",
    "P.S. Not interested? Just reply \"no\" and I won't email again.",
  ].join("\n");
  return { ...p, link, subject, body };
});
process.stdout.write(JSON.stringify(out, null, 2) + "\n");
