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

`data/products.json` is the shared source for CPU/GPU/RAM/storage/PSU cards, product details, demonstration prices and cart calculations. IDs are stable URL slugs and cart identifiers. Do not rename existing IDs casually.

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

## Cached deployments

The renderer embeds content-hashed URLs for `shop.js` and `products.json`. Regenerate pages after changing either file, and publish those files and generated pages together. The runtime revalidates catalogue responses and checks their product count before initializing filters or reading the saved cart; an incomplete response leaves the existing saved selection untouched. Browser regression tests simulate returning visitors with old unversioned assets.

## Storage catalogue

Storage pages are `/stockage/` and `/en/storage/`. The 24 entries cover NVMe SSDs, 2.5-inch SATA SSDs and 3.5-inch SATA hard drives from six brands. Each entry includes an exact SKU, advertised capacity in GB, drive type, protocol, interface and form factor. Preserve manufacturer capacity labels: 1024 GB should not be rewritten as 1 TB. Storage-specific type, protocol and capacity filters reuse the shared search, brand, sort and cart controls. Explain M.2 protocol/length compatibility, PCIe generation, SATA cabling, drive bays and cooling without promising measured performance or endurance. Product photography remains postponed.

## CPU and GPU brands

CPU manufacturers are AMD and Intel. GPU cards distinguish the card brand (`brand`) from the chip designer (`chip_brand`, falling back to the original AMD/NVIDIA brand). Seven specific partner models supplement the original generic GPU entries; preserve the original IDs and cart selections. Chip and card-brand filters can be combined. Partner cards use only chip-level memory and architecture information; do not infer clocks, dimensions, connectors or cooling specifications from a generic GPU. Manufacturer range links are references, not confirmed model-page verification.

## Power supplies

PSU categories are `/alimentations/` and `/en/power-supplies/`, with 24 models across six brands. Store rated wattage, physical ATX form factor and cable modularity; filters use exact wattage and modularity alongside brand/search/sort. Year labels distinguish selected product revisions. Do not infer ATX electrical revision, GPU connectors, supplied cable counts, efficiency certification, dimensions or warranties from wattage or range names. Manufacturer pages remain inaccessible in the cloud environment; detailed specifications need verification before expansion. Explain whole-system sizing, case clearance, connector checks and why modular PSU cables are not universally interchangeable. Reuse stable cart IDs and the versioned catalogue deployment.
