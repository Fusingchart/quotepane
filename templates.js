// Starter price sheets. Rates are rough US starting points; owners set their own.
window.QP_TEMPLATES = [
  {
    name: "Pressure washing",
    config: {
      biz: "Sparkle Pressure Washing", title: "Get an instant quote", min: 150, spread: 10,
      services: [
        { n: "House wash (soft wash)", u: "sqft", r: 0.2, m: 200, ph: "Home size", p: [{ l: "1,500 sq ft", v: 1500 }, { l: "2,500", v: 2500 }, { l: "3,500", v: 3500 }] },
        { n: "Driveway & walkways", u: "sqft", r: 0.18, m: 100, ph: "Concrete area", p: [{ l: "1-car", v: 300 }, { l: "2-car", v: 600 }, { l: "3-car", v: 900 }] },
        { n: "Roof soft wash", u: "sqft", r: 0.45, m: 350, ph: "Roof area" },
        { n: "Deck or patio", u: "sqft", r: 0.6, m: 150, ph: "Deck area" },
        { n: "Gutter brightening", u: "linft", r: 1.5, m: 100, ph: "Gutter length" },
      ],
    },
  },
  {
    name: "Window cleaning",
    config: {
      biz: "Crystal Clear Windows", title: "Price your window cleaning", min: 120, spread: 0,
      services: [
        { n: "Exterior windows", u: "pane", r: 7, ph: "Number of windows", p: [{ l: "15", v: 15 }, { l: "25", v: 25 }, { l: "40", v: 40 }] },
        { n: "Interior windows", u: "pane", r: 5, ph: "Number of windows" },
        { n: "Screen cleaning", u: "item", r: 3, ph: "Number of screens" },
        { n: "Hard water removal", u: "pane", r: 15, ph: "Windows with stains" },
        { n: "Skylights", u: "item", r: 20, ph: "Number of skylights" },
      ],
    },
  },
  {
    name: "Holiday lights",
    config: {
      biz: "Bright Nights Lighting", title: "Instant holiday lighting quote", min: 400, spread: 10,
      services: [
        { n: "Roofline lights", u: "linft", r: 4, ph: "Roofline length", p: [{ l: "100 ft", v: 100 }, { l: "150 ft", v: 150 }, { l: "200 ft", v: 200 }] },
        { n: "Tree wraps", u: "item", r: 90, ph: "Number of trees" },
        { n: "Bush / shrub nets", u: "item", r: 35, ph: "Number of bushes" },
        { n: "Wreaths & garland (front door)", u: "flat", r: 150 },
        { n: "Takedown & storage", u: "flat", r: 150 },
      ],
    },
  },
  {
    name: "Gutter cleaning",
    config: {
      biz: "Clear Flow Gutters", title: "Get your gutter quote", min: 125, spread: 0,
      services: [
        { n: "Gutter cleaning (1 story)", u: "linft", r: 1.25, ph: "Gutter length", p: [{ l: "120 ft", v: 120 }, { l: "160 ft", v: 160 }, { l: "200 ft", v: 200 }] },
        { n: "Gutter cleaning (2+ story)", u: "linft", r: 1.75, ph: "Gutter length" },
        { n: "Downspout flush", u: "item", r: 15, ph: "Number of downspouts" },
        { n: "Gutter guard install", u: "linft", r: 9, ph: "Length to cover" },
      ],
    },
  },
  {
    name: "House cleaning",
    config: {
      biz: "Fresh Nest Cleaning", title: "Get a cleaning price in 30 seconds", min: 110, spread: 10,
      services: [
        { n: "Standard clean", u: "sqft", r: 0.1, ph: "Home size", p: [{ l: "1,000 sq ft", v: 1000 }, { l: "2,000", v: 2000 }, { l: "3,000", v: 3000 }] },
        { n: "Deep clean", u: "sqft", r: 0.2, ph: "Home size" },
        { n: "Inside oven", u: "flat", r: 35 },
        { n: "Inside fridge", u: "flat", r: 35 },
        { n: "Interior windows", u: "pane", r: 5, ph: "Number of windows" },
      ],
    },
  },
  {
    name: "Lawn care",
    config: {
      biz: "Green Edge Lawn Care", title: "Instant mowing quote", min: 40, spread: 10,
      services: [
        { n: "Mow, edge & blow", u: "sqft", r: 0.008, m: 40, ph: "Lawn area", p: [{ l: "Small yard", v: 4000 }, { l: "Medium", v: 8000 }, { l: "Large", v: 15000 }] },
        { n: "Leaf cleanup", u: "hour", r: 55, ph: "Estimated hours" },
        { n: "Hedge trimming", u: "item", r: 12, ph: "Number of shrubs" },
        { n: "Mulch install", u: "item", r: 9, ph: "Bags / yards of mulch" },
      ],
    },
  },
];
