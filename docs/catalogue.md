# NEXRIG catalogue conventions

NEXRIG is a fictional Moroccan PC store and SEO learning project. Continue this approach when adding RAM, storage, motherboards or other categories:

- Lead category pages with browsable product cards, search, brand filters, sorting and product-detail links. Put educational guidance below the catalogue.
- Maintain French and English pages with matching language switches, self-referencing canonicals and reciprocal hreflang. Preserve existing URLs.
- Reuse the shared cart, card styles and product data instead of creating a separate cart for each category.
- Use real, accurately named models and supported specifications. Check manufacturer documentation before adding detailed specifications or performance claims. Current external manufacturer links could not be verified from the restricted setup environment.
- Never invent reviews, stock, delivery guarantees, company credentials or real selling prices. `demo_price_mad` is a fictional amount for testing; show a demonstration-price label beside every price and total.
- The cart stores product IDs and integer quantities locally in the browser. It is a demonstration, with no payment, checkout, personal-data collection or real order submission.
- The current SVGs are original generic illustrations, explicitly labeled as illustrations rather than model photographs. Replace them only with appropriately licensed, accurate images; do not present a generic illustration as a product photo.
- Do not add fictional offers, availability or ratings to structured data. Cart pages use `noindex,follow` and are excluded from the sitemap.

## Content and generation

`data/products.json` is the shared source for CPU/GPU/RAM cards, product details, demonstration prices and cart calculations. IDs are stable URL slugs and cart identifiers. Do not rename existing IDs casually.

Run from the repository root:

```sh
python3 scripts/build_catalogue.py
```

This uses only Python's standard library. It generates product pages and cart pages, refreshes catalogue blocks and homepage selections, and updates the sitemap. The surrounding category buying guides remain hand-written and are preserved by the marked catalogue blocks. Product and cart HTML is generated: edit the data or renderer, then regenerate rather than editing these generated pages directly.

For a new category, extend `CATEGORY_PATHS`, translated labels, specification rendering and product templates in the renderer; create its bilingual guide pages with a catalogue section; add its data; update navigation and the sitemap's category list. The cart uses stable product IDs and the existing shared data automatically. Add a clearly labeled original illustration or licensed model image and extend the image rendering if needed.

Test filters, product links, language switches, cart additions from every entry point, quantity changes, removal, clearing, persistence, mobile layouts and metadata before publishing. Hosting remains plain static GitHub Pages with no production package dependencies.

## Validation

Run the catalogue integrity checks with `python3 -m unittest discover -s tests -v`.

Run `node tests/browser-smoke.cjs` for cart and responsive-browser checks in an environment with the Playwright Node package and Chromium installed. This test starts and stops its own Python HTTP server on port 8765, uses temporary files, and exercises filtering, quantities, computed totals, persistence, failure states and both languages. In the current cloud environment it uses system Chromium at `/usr/lib/chromium/chromium`; adjust that executable path for another machine. No browser test dependencies are shipped to the website.

## RAM catalogue

RAM pages are `/ram/` and `/en/ram/`. Entries carry an exact manufacturer part number (`sku`), total kit capacity, module count, DDR generation, UDIMM form factor and advertised data rate in MT/s. A kit of 2 × 16 GB is 32 GB in total. Do not claim the rated speed is automatic or universally guaranteed: profiles, BIOS, CPU and motherboard compatibility matter. Search includes the part number; RAM-only generation and capacity filters extend the shared brand/search/sort controls. The existing cart and storage key are unchanged, so older CPU/GPU selections survive.
