# Nova — Analytics for Modern Teams

A polished, fully responsive multi-page marketing site for **Nova, a fictional analytics product**. Built as a self-directed portfolio piece to demonstrate modern marketing-site craft: smooth animations, thoughtful interactions, and a clean component-style structure — plus a small PHP backend for the contact form.

**Nova is not a real company and has no real clients.** All product copy, company names, testimonials, and numbers on the site are placeholder content written for the fictional product demo.

## Pages

- `index.html` — home: hero with animated gradient blobs and a CSS dashboard mockup, feature preview, animated stats, pricing preview, testimonial carousel, FAQ accordion, contact form
- `features.html` — full feature detail page with per-feature highlights and a three-step "how it works" section
- `pricing.html` — full pricing page with monthly/yearly toggle and a plan-comparison table

All three pages share `style.css` and `script.js`, with a shared sticky header and dark/light mode toggle.

## Features

- Sticky header with mobile hamburger menu and scroll shadow
- Hero with animated gradient blobs and a pure-CSS dashboard mockup
- Scroll-reveal animations via IntersectionObserver
- Dark / light mode toggle, persisted in localStorage (respects OS preference)
- Monthly/yearly pricing toggle with animated price swaps
- Testimonial carousel with autoplay, arrows, dots, and pause-on-hover (sample quotes for the fictional product)
- FAQ accordion (one open at a time)
- Contact form with client-side validation; submits to the PHP backend when one is available
- Animated stat counters, responsive at 960px / 640px breakpoints

## Tech stack

HTML, CSS (custom properties, flexbox/grid), **Bootstrap 5** (CDN — layout and components, with custom CSS on top), vanilla JavaScript, **PHP** (dependency-free backend, no framework, no database). No build step.

## Backend — `contact.php`

The contact form POSTs JSON to `contact.php`, which validates name / email / message (mirroring the client-side checks) and appends the lead to `data/leads.json` (file-locked). Responses are JSON:

- `200 {"ok": true}` — lead saved
- `422 {"ok": false, "errors": {...}}` — validation failed
- `405` — non-POST request

**The PHP backend does not run on GitHub Pages** (static hosting) or `file://`. When `contact.php` is unreachable, the form shows a clearly-labelled demo success state — *"Demo mode — no backend connected"* — and never pretends the message was sent.

## Run locally

```bash
cd nova-landing-page
php -S localhost:8000
# then open http://localhost:8000
```

Without PHP, any static server works for the pages (e.g. `python3 -m http.server 8000`), but the contact form will show the demo state instead of saving leads.

## Live demo

https://khushee16.github.io/nova-landing-page/

On the live Pages demo the pages, theme toggle, carousel, pricing toggle, and FAQ all work; the contact form shows the demo state because Pages has no PHP backend.

## Author

Khushi Khatri — self-directed portfolio project, not client work.
