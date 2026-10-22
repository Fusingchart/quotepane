# QuotePane

Instant-quote widget for service businesses (pressure washing, window cleaning, gutters, holiday lights, cleaning, lawn care). Static site on GitHub Pages; no backend.

- `index.html`: landing page with live demo and pricing
- `builder.html`: owners set prices and copy the embed code / quote link / QR
- `widget.js`: the embeddable widget (shadow DOM). Leads go to the owner's email via FormSubmit
- `quote.html`: hosted quote page for owners without a website (`#c=<config>`)
- `config.js`: Gumroad checkout URL + product ID for the $29 Pro license
- `node test.js`: pricing tests
