/* QuotePane widget: instant price quotes for service businesses.
 * Embed: <script src="https://fusingchart.github.io/quotepane/widget.js" data-config="..."></script>
 * The config is base64url JSON produced by the builder. Leads are emailed to the
 * owner through FormSubmit; nothing else leaves the visitor's browser. */
(function () {
  "use strict";

  var SITE = "https://fusingchart.github.io/quotepane/";
  var FREE_SERVICE_LIMIT = 3;
  var UNITS = {
    sqft: { label: "sq ft", per: "per sq ft" },
    linft: { label: "linear ft", per: "per linear ft" },
    pane: { label: "windows", per: "per window" },
    item: { label: "items", per: "each" },
    hour: { label: "hours", per: "per hour" },
    flat: { label: "", per: "flat" },
  };

  function decodeConfig(str) {
    var b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    var bytes = atob(b64);
    var pct = "";
    for (var i = 0; i < bytes.length; i++) pct += "%" + ("0" + bytes.charCodeAt(i).toString(16)).slice(-2);
    return JSON.parse(decodeURIComponent(pct));
  }

  function encodeConfig(cfg) {
    var utf8 = unescape(encodeURIComponent(JSON.stringify(cfg)));
    return btoa(utf8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function money(cfg, n) {
    var rounded = Math.round(n);
    return (cfg.currency || "$") + rounded.toLocaleString("en-US");
  }

  // Pure pricing so the builder and tests can share it.
  function computeQuote(cfg, picks) {
    var services = activeServices(cfg);
    var lines = [];
    var subtotal = 0;
    services.forEach(function (s, i) {
      var p = picks[i];
      if (!p || !p.on) return;
      var qty = s.u === "flat" ? 1 : Math.max(0, Number(p.qty) || 0);
      if (s.u !== "flat" && qty <= 0) return;
      var amount = qty * (Number(s.r) || 0);
      if (s.m && amount < s.m) amount = Number(s.m);
      lines.push({ name: s.n, qty: qty, unit: s.u, amount: amount });
      subtotal += amount;
    });
    var discount = 0;
    var b = cfg.pro && cfg.bundle;
    if (b && b.pct > 0 && lines.length >= (b.n || 2)) discount = subtotal * (b.pct / 100);
    var total = subtotal - discount;
    var minApplied = false;
    if (lines.length && cfg.min && total < cfg.min) {
      total = Number(cfg.min);
      minApplied = true;
    }
    var spread = Math.max(0, Number(cfg.spread) || 0) / 100;
    return {
      lines: lines,
      subtotal: subtotal,
      discount: discount,
      total: total,
      minApplied: minApplied,
      low: total * (1 - spread),
      high: total * (1 + spread),
    };
  }

  function activeServices(cfg) {
    var list = cfg.services || [];
    return cfg.pro ? list : list.slice(0, FREE_SERVICE_LIMIT);
  }

  function css(color) {
    return (
      ":host{all:initial;display:block}" +
      ".qp{--c:" + color + ";font:15px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;" +
      "color:#1b1f24;background:#fff;border:1px solid #e3e6ea;border-radius:14px;padding:22px;max-width:560px;box-sizing:border-box;margin:0 auto}" +
      ".qp *{box-sizing:border-box}" +
      ".qp h2{font-size:20px;margin:0 0 4px;font-weight:700}" +
      ".qp .sub{color:#5b6570;margin:0 0 16px;font-size:14px}" +
      ".svc{border:1px solid #e3e6ea;border-radius:10px;padding:12px 14px;margin-bottom:10px;transition:border-color .15s,background .15s}" +
      ".svc.on{border-color:var(--c);background:color-mix(in srgb,var(--c) 6%,#fff)}" +
      ".svc label.top{display:flex;align-items:center;gap:10px;cursor:pointer;font-weight:600}" +
      ".svc input[type=checkbox]{width:18px;height:18px;accent-color:var(--c);margin:0}" +
      ".svc .rate{margin-left:auto;font-weight:400;color:#5b6570;font-size:13px;white-space:nowrap;padding-left:8px}" +
      ".svc .qty{display:none;margin-top:10px;gap:8px;align-items:center;flex-wrap:wrap}" +
      ".svc.on .qty{display:flex}" +
      ".qp input[type=number],.qp input[type=text],.qp input[type=email],.qp input[type=tel],.qp textarea{font:inherit;border:1px solid #cfd5db;border-radius:8px;padding:9px 11px;width:100%;color:#1b1f24;background:#fff}" +
      ".svc .qty input{width:120px}" +
      ".qp input:focus,.qp textarea:focus{outline:2px solid var(--c);outline-offset:1px;border-color:transparent}" +
      ".chip{border:1px solid #cfd5db;background:#fff;border-radius:999px;padding:5px 11px;font:inherit;font-size:13px;cursor:pointer;color:#1b1f24}" +
      ".chip:hover{border-color:var(--c)}" +
      ".total{display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid #e3e6ea;margin-top:14px;padding-top:14px}" +
      ".total .amt{font-size:26px;font-weight:800;color:var(--c)}" +
      ".note{font-size:12px;color:#5b6570;margin:6px 0 0}" +
      ".btn{display:block;width:100%;margin-top:16px;border:0;border-radius:10px;padding:13px;font:inherit;font-weight:700;color:#fff;background:var(--c);cursor:pointer}" +
      ".btn:disabled{opacity:.45;cursor:not-allowed}" +
      ".link{background:none;border:0;color:var(--c);font:inherit;cursor:pointer;padding:0;margin-top:10px}" +
      ".row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}" +
      ".full{margin-bottom:10px}" +
      ".qp label.f{display:block;font-size:13px;font-weight:600;margin-bottom:4px}" +
      ".err{color:#b42318;font-size:13px;margin-top:8px}" +
      ".done{text-align:center;padding:20px 0}" +
      ".done .tick{width:52px;height:52px;border-radius:50%;background:var(--c);color:#fff;font-size:28px;line-height:52px;margin:0 auto 12px}" +
      ".badge{display:block;text-align:center;font-size:11px;color:#8a939c;margin-top:14px;text-decoration:none}" +
      ".badge:hover{color:var(--c)}" +
      "@media (max-width:480px){.qp{padding:16px}.row{grid-template-columns:1fr}}"
    );
  }

  function render(host, cfg) {
    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;
    var services = activeServices(cfg);
    var picks = services.map(function () { return { on: false, qty: "" }; });
    var state = { step: "pick", sending: false, error: "" };

    function serviceHTML(s, i) {
      var u = UNITS[s.u] || UNITS.item;
      var r = Number(s.r) || 0;
      var shown = Number.isInteger(r) ? money(cfg, r) : (cfg.currency || "$") + r.toFixed(r < 0.1 ? 3 : 2);
      var rate = cfg.hideRates ? "" : shown + (s.u === "flat" ? "" : " " + u.per);
      var presets = (s.p || []).map(function (pr) {
        return '<button type="button" class="chip" data-i="' + i + '" data-v="' + esc(pr.v) + '">' + esc(pr.l) + "</button>";
      }).join("");
      var qty = s.u === "flat" ? "" :
        '<div class="qty"><input type="number" min="0" inputmode="decimal" data-q="' + i + '" placeholder="' +
        esc(s.ph || "How many " + u.label + "?") + '" aria-label="' + esc(s.n) + " " + esc(u.label) + '"><span>' + esc(u.label) + "</span>" + presets + "</div>";
      return '<div class="svc' + (picks[i].on ? " on" : "") + '"><label class="top"><input type="checkbox" data-c="' + i + '"' +
        (picks[i].on ? " checked" : "") + ">" + esc(s.n) + '<span class="rate">' + esc(rate) + "</span></label>" + qty + "</div>";
    }

    function totalHTML(q) {
      if (!q.lines.length) return '<div class="total"><span>Your estimate</span><span class="amt">—</span></div>';
      var amt = cfg.spread > 0 ? money(cfg, q.low) + "–" + money(cfg, q.high) : money(cfg, q.total);
      var notes = [];
      if (q.discount > 0) notes.push("Includes " + cfg.bundle.pct + "% multi-service discount.");
      if (q.minApplied) notes.push("Minimum job charge of " + money(cfg, cfg.min) + " applies.");
      notes.push("Estimate only. Final price confirmed after a quick review.");
      return '<div class="total"><span>Your estimate</span><span class="amt">' + amt + '</span></div><p class="note">' + notes.join(" ") + "</p>";
    }

    function badge() {
      return cfg.pro ? "" : '<a class="badge" href="' + SITE + '?ref=badge" target="_blank" rel="noopener">Instant quotes by QuotePane</a>';
    }

    function draw() {
      var q = computeQuote(cfg, picks);
      var html = '<style>' + css(cfg.color || "#0b6bcb") + '</style><div class="qp">';
      if (state.step === "pick") {
        html += "<h2>" + esc(cfg.title || "Get an instant quote") + '</h2><p class="sub">' + esc(cfg.biz || "") +
          (cfg.area ? " · " + esc(cfg.area) : "") + "</p>";
        html += services.map(serviceHTML).join("");
        html += '<div data-total>' + totalHTML(q) + "</div>";
        html += '<button class="btn" data-next' + (q.lines.length ? "" : " disabled") + ">Book this quote</button>";
      } else if (state.step === "contact") {
        var amt = cfg.spread > 0 ? money(cfg, q.low) + "–" + money(cfg, q.high) : money(cfg, q.total);
        html += "<h2>Almost done</h2><p class=\"sub\">Estimate " + amt + ". Where should " + esc(cfg.biz || "we") + " reach you?</p>" +
          '<form data-form novalidate><div class="row"><div><label class="f">Name</label><input type="text" name="name" autocomplete="name" required></div>' +
          '<div><label class="f">Phone</label><input type="tel" name="phone" autocomplete="tel" required></div></div>' +
          '<div class="full"><label class="f">Email</label><input type="email" name="email" autocomplete="email"></div>' +
          '<div class="full"><label class="f">Service address</label><input type="text" name="address" autocomplete="street-address" required></div>' +
          '<div class="full"><label class="f">Anything we should know? (optional)</label><textarea name="notes" rows="2"></textarea></div>' +
          (state.error ? '<div class="err">' + esc(state.error) + "</div>" : "") +
          '<button class="btn" type="submit"' + (state.sending ? " disabled" : "") + ">" + (state.sending ? "Sending…" : "Request booking") + "</button></form>" +
          '<button class="link" data-back>← Change services</button>';
      } else {
        html += '<div class="done"><div class="tick">✓</div><h2>Request sent</h2><p class="sub">' +
          esc(cfg.thanks && cfg.pro ? cfg.thanks : "Thanks! " + (cfg.biz || "We") + " will contact you shortly to confirm your price and schedule.") +
          "</p></div>";
      }
      html += badge() + "</div>";
      root.innerHTML = html;
      bind();
    }

    function refreshTotal() {
      var q = computeQuote(cfg, picks);
      var t = root.querySelector("[data-total]");
      if (t) t.innerHTML = totalHTML(q);
      var b = root.querySelector("[data-next]");
      if (b) b.disabled = !q.lines.length;
    }

    function bind() {
      root.querySelectorAll("[data-c]").forEach(function (el) {
        el.addEventListener("change", function () {
          var i = +el.getAttribute("data-c");
          picks[i].on = el.checked;
          el.closest(".svc").classList.toggle("on", el.checked);
          if (el.checked) {
            var input = root.querySelector('[data-q="' + i + '"]');
            if (input) input.focus();
          }
          refreshTotal();
        });
      });
      root.querySelectorAll("[data-q]").forEach(function (el) {
        var i = +el.getAttribute("data-q");
        el.value = picks[i].qty;
        el.addEventListener("input", function () { picks[i].qty = el.value; refreshTotal(); });
      });
      root.querySelectorAll(".chip").forEach(function (el) {
        el.addEventListener("click", function () {
          var i = +el.getAttribute("data-i");
          picks[i].qty = el.getAttribute("data-v");
          root.querySelector('[data-q="' + i + '"]').value = picks[i].qty;
          refreshTotal();
        });
      });
      var next = root.querySelector("[data-next]");
      if (next) next.addEventListener("click", function () { state.step = "contact"; state.error = ""; draw(); });
      var back = root.querySelector("[data-back]");
      if (back) back.addEventListener("click", function () { state.step = "pick"; draw(); });
      var form = root.querySelector("[data-form]");
      if (form) form.addEventListener("submit", function (e) { e.preventDefault(); submit(form); });
    }

    function submit(form) {
      var data = {};
      ["name", "phone", "email", "address", "notes"].forEach(function (k) { data[k] = form.elements[k].value.trim(); });
      if (!data.name || !data.phone || !data.address) {
        state.error = "Please add your name, phone and address.";
        draw();
        return;
      }
      var q = computeQuote(cfg, picks);
      var est = cfg.spread > 0 ? money(cfg, q.low) + " – " + money(cfg, q.high) : money(cfg, q.total);
      var breakdown = q.lines.map(function (l) {
        var u = UNITS[l.unit] || UNITS.item;
        return l.name + (l.unit === "flat" ? "" : " (" + l.qty + " " + u.label + ")") + ": " + money(cfg, l.amount);
      }).join("\n");
      if (cfg.demo || !cfg.email) {
        state.step = "done";
        draw();
        return;
      }
      state.sending = true;
      state.error = "";
      draw();
      fetch("https://formsubmit.co/ajax/" + encodeURIComponent(cfg.email), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: "New quote request: " + data.name + " (" + est + ")",
          _template: "table",
          _captcha: "false",
          Name: data.name,
          Phone: data.phone,
          Email: data.email || "(not given)",
          Address: data.address,
          Estimate: est,
          Services: breakdown,
          Notes: data.notes || "(none)",
          _replyto: data.email || undefined,
        }),
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          state.sending = false;
          if (res.ok && String(res.j.success) !== "false") state.step = "done";
          else state.error = "Couldn't send right now. Please call " + (cfg.phone || "us") + " instead.";
          draw();
        })
        .catch(function () {
          state.sending = false;
          state.error = "Couldn't send right now. Please call " + (cfg.phone || "us") + " instead.";
          draw();
        });
    }

    draw();
  }

  function mount(target, cfg) {
    if (typeof target === "string") target = document.querySelector(target);
    if (!target) return;
    target.innerHTML = "";
    var host = document.createElement("div");
    target.appendChild(host);
    render(host, cfg);
  }

  window.QuotePane = { mount: mount, computeQuote: computeQuote, encode: encodeConfig, decode: decodeConfig };

  var script = document.currentScript;
  var raw = script && script.getAttribute("data-config");
  if (raw) {
    var cfg;
    try { cfg = decodeConfig(raw); } catch (e) { console.error("QuotePane: bad config", e); return; }
    var where = script.getAttribute("data-target");
    var target = where ? document.querySelector(where) : null;
    if (!target) {
      target = document.createElement("div");
      script.parentNode.insertBefore(target, script);
    }
    mount(target, cfg);
  }
})();
