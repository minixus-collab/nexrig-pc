# NEXRIG development

NEXRIG is a fictional Moroccan PC components store and SEO portfolio. Category pages should look like storefront catalogues, with products first and buying guidance below.

Before adding or changing product categories, read [docs/catalogue.md](docs/catalogue.md). Reuse `data/products.json`, the shared card styles, the static renderer and the browser cart. Apply the same product listings, filters, product pages and cart behavior to future categories.

Keep French and English versions in sync. Preserve existing working URLs, canonicals and other SEO improvements. Never invent reviews, stock, company credentials, delivery promises or real selling prices. Label every fictional price as a demonstration price. Do not implement real payment or order submission unless explicitly requested.

After data or renderer changes, run `python3 scripts/build_catalogue.py` and the relevant checks documented in `docs/catalogue.md`. Generated product/cart pages should be edited through their data or renderer.
